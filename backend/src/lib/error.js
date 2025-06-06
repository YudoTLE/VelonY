export function mapSupabaseError(error) {
  const errorMap = {
    'PGRST116': 404,
    '42501': 403,   
    '23505': 409,
    '23503': 400,
    'JWT expired': 401,
    'PGRST301': 401,
  }
  
  const status = errorMap[error.code] || 500
  const err = new Error(error.message)
  err.status = status
  return err
}