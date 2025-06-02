const tokenMap = new Map()

export function saveToken(key, token) {
  tokenMap.set(key, token)
}

export function getToken(key) {
  return tokenMap.get(key)
}

export function updateAccessToken(key, newAccessToken, expiresIn) {
  const token = tokenMap.get(key)
  if (!token) return
  tokenMap.set(key, {
    ...token,
    accessToken: newAccessToken,
    expiresAt: Date.now() + expiresIn * 1000
  })
}