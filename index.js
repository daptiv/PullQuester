'use strict';
var program = require('commander');

program
  .version('0.3.0')
  .option('-i, --init', 'Initialize a repo to use this tool')
  .option('-in, --install', 'Install the dependencies of this tool')
  .parse(process.argv);

if (program.init) {
    require('./src/commands/init')();
}
else if (program.install) {
    require('./src/commands/install')();
}
else {
    require('./src/commands/pull')();
}




