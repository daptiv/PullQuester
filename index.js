'use strict';
var program = require('commander');

program
  .version('0.0.1')
  .option('-i, --init', 'Initialize a repo to use this tool')
  .parse(process.argv);

if (program.init) {
    require('./init')();
}
else {
    require('./pull')();
}




