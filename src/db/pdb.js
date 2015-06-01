var path = require('path')
var fs = require('fs-extra')
var Stealth = require('stealth')
var env = require('../env')

// only one for now
// should only be ref'd from createPdb
var PDB = {}

function createPdb (config) {
  config = config || {}
  var file = config.file || path.join(env.datadir, 'obsidian', 'pdb.db')

  var _pdb = PDB
  _pdb.file = file
  _pdb.data = null

  _pdb.init = init.bind(_pdb)
  _pdb.add = add.bind(_pdb)
  _pdb.resolveSync = resolveSync.bind(_pdb)

  return _pdb
}

function init (callback) {
  var self = this
  fs.exists(this.file, function (exists) {
    if (exists) {
      fs.readJson(self.file, function (err, data) {
        if (err) return callback(err)
        self.data = data
        callback()
      })
    } else {
      self.data = {names: {}}
      fs.outputJson(self.file, self.data, callback)
    }
  })
}

function add (name, pubkeys, txId, blockHeight, callback) {
  if (this.data == null) return callback(new Error('You forgot to call init()'))

  var stealth = new Stealth(pubkeys)

  this.data.names[name] = {
    stealth: stealth.toString(),
    txId: txId,
    blockHeight: blockHeight
  }

  fs.outputJson(this.file, this.data, callback)
}

function resolveSync (name) {
  if (this.data == null) throw new Error('You forgot to call init()')
  return name in this.data.names ? this.data.names[name] : null
}

module.exports = {
  createPdb: createPdb
}
