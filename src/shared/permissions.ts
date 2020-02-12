export enum Permissions {

  // Special
  ADMINISTRATOR = 0x00000400,

  // Post permissions
  CREATE_POSTS  = 0x00000001,
  DELETE_POSTS  = 0x00000002,
  EDIT_POSTS    = 0x00000004,
  COMMENT_POSTS = 0x00000008,
  PIN_POSTS     = 0x00000010,

  // Category permissions
  CREATE_CATEGORIES  = 0x00000020,
  DELETE_CATEGORIES  = 0x00000040,
  EDIT_CATEGORIES    = 0x00000080,

  // Presets
  DEFAULT_USER = CREATE_POSTS | COMMENT_POSTS | EDIT_POSTS
}
