/**
  * @module types
  */

/**
  * @typedef { Object } FileObj
  * @property { string } name
  * @property { boolean } is_directory
  * @property { string } permissions
  * @property { number } links
  * @property { string } owner
  * @property { string } group
  * @property { string } size
  * @property { string } modified_time
  * @property { string } access_time
  * @property { string } change_time
  */

/**
  * @typedef { Object } Env
  * @property { string[] } history
  * @property { string } username
  * @property { string } cwd
  * @property { FileObj[] } filetree
  */

