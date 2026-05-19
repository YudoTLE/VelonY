import crypto from 'node:crypto'

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')

const hmac = (key, value, encoding) =>
  crypto.createHmac('sha256', key).update(value).digest(encoding)

const encodePathSegment = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, char =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  )

const buildObjectPath = (key, bucket, forcePathStyle) => {
  const encodedKey = key.split('/').map(encodePathSegment).join('/')
  return forcePathStyle
    ? `/${encodePathSegment(bucket)}/${encodedKey}`
    : `/${encodedKey}`
}

const getSigningKey = (secretAccessKey, dateStamp, region) => {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, 's3')
  return hmac(kService, 'aws4_request')
}

const normalizePrefix = (prefix = '') => prefix.replace(/^\/+|\/+$/g, '')

export default function S3ObjectStorageService({ fetch }) {
  const getConfig = () => {
    const bucket = process.env.S3_BUCKET
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
    const sessionToken = process.env.S3_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN
    const endpoint = process.env.S3_ENDPOINT || `https://s3.${region}.amazonaws.com`
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true'

    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw {
        status: 500,
        message: 'S3 storage is not configured',
      }
    }

    return {
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
      endpoint,
      forcePathStyle,
    }
  }

  const requestObject = async ({
    method,
    key,
    body = Buffer.alloc(0),
    contentType,
    cacheControl,
  }) => {
    const config = getConfig()
    const endpointUrl = new URL(config.endpoint)

    if (!config.forcePathStyle) {
      endpointUrl.hostname = `${config.bucket}.${endpointUrl.hostname}`
    }

    const canonicalUri = buildObjectPath(key, config.bucket, config.forcePathStyle)
    endpointUrl.pathname = canonicalUri

    const payloadHash = hash(body)
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)

    const headers = {
      host: endpointUrl.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    }

    if (contentType) {
      headers['content-type'] = contentType
    }
    if (cacheControl) {
      headers['cache-control'] = cacheControl
    }
    if (config.sessionToken) {
      headers['x-amz-security-token'] = config.sessionToken
    }

    const acl = process.env.S3_AGENT_AVATAR_ACL
    if (method === 'PUT' && acl) {
      headers['x-amz-acl'] = acl
    }

    const sortedHeaderEntries = Object.entries(headers)
      .map(([name, value]) => [name.toLowerCase(), String(value).trim()])
      .sort(([a], [b]) => a.localeCompare(b))

    const canonicalHeaders = sortedHeaderEntries
      .map(([name, value]) => `${name}:${value}\n`)
      .join('')
    const signedHeaders = sortedHeaderEntries.map(([name]) => name).join(';')
    const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`

    const canonicalRequest = [
      method,
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n')

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      hash(canonicalRequest),
    ].join('\n')

    const signature = hmac(
      getSigningKey(config.secretAccessKey, dateStamp, config.region),
      stringToSign,
      'hex'
    )

    const authorization = [
      `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ')

    const requestHeaders = Object.fromEntries(
      Object.entries(headers).filter(([name]) => name !== 'host')
    )

    const response = await fetch(endpointUrl, {
      method,
      headers: {
        ...requestHeaders,
        authorization,
      },
      body: method === 'DELETE' ? undefined : body,
    })

    if (!response.ok) {
      const text = await response.text()
      throw {
        status: 502,
        message: `Failed to write avatar to S3: ${text || response.statusText}`,
      }
    }
  }

  const avatarKey = (agentId) => {
    const prefix = normalizePrefix(process.env.S3_AGENT_AVATAR_PREFIX || '')
    return [prefix, `${agentId}.webp`].filter(Boolean).join('/')
  }

  return {
    async putAgentAvatar({ agentId, body, contentType }) {
      await requestObject({
        method: 'PUT',
        key: avatarKey(agentId),
        body,
        contentType,
        cacheControl: process.env.S3_AGENT_AVATAR_CACHE_CONTROL || 'public, max-age=300',
      })
    },

    async deleteAgentAvatar(agentId) {
      await requestObject({
        method: 'DELETE',
        key: avatarKey(agentId),
      })
    },
  }
}
