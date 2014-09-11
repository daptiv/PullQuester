'use strict';
var program = require('commander');

program
  .version('0.3.0')
  .option('-i, --init', 'Initialize a repo to use this tool')
  .parse(process.argv);

if (program.init) {
    require('./src/commands/init')();
}
else {
    require('./src/commands/pull')();
}




