export enum Permissions {

  // Special
  ADMINISTRATOR = 1 << 8,

  // Post permissions
  CREATE_POSTS  = 1 << 0,
  DELETE_POSTS  = 1 << 1,
  EDIT_POSTS    = 1 << 2,
  COMMENT_POSTS = 1 << 3,
  PIN_POSTS     = 1 << 4,

  // Category permissions
  CREATE_CATEGORIES = 1 << 5,
  DELETE_CATEGORIES = 1 << 6,
  EDIT_CATEGORIES   = 1 << 7,

  // Thread permissions
  CREATE_THREADS = 1 << 9,
  DELETE_THREADS = 1 << 10,
  EDIT_THREADS   = 1 << 11,

  // Role permissions
  MANAGE_ROLES = 1 << 12,
  ASSIGN_ROLES = 1 << 13,

  // Presets
  DEFAULT_USER = CREATE_POSTS | COMMENT_POSTS | CREATE_THREADS
}
