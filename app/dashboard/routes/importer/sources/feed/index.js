var load = require("./load");
var parse = require("./parse");
var fs = require("fs-extra");

if (require.main === module)
  main(process.argv[2], process.argv[3], function(err) {
    if (err) throw err;

    process.exit();
  });

function main(feed_url, output_directory, callback) {
  load(feed_url, function(err, $) {
    if (err) return callback(err);

    fs.emptyDir(output_directory, function(err) {
      if (err) return callback(err);

      fs.outputFileSync(output_directory + "/input.xml", $.html());

      parse($, output_directory, callback);
    });
  });
}

module.exports = main;
