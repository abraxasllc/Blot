var Entries = require("entries");
var async = require("async");
var Entry = require("entry");

module.exports = function(blogID, update, callback) {
  var RENAME_PERIOD = 1000 * 60; // 1 minute
  var after = Date.now() - RENAME_PERIOD;

  var renames = {};

  Entries.getCreated(blogID, after, function(err, createdEntries) {
    if (err) return callback(err);

    Entries.getDeleted(blogID, after, function(err, deletedEntries) {
      if (err) return callback(err);

      createdEntries.forEach(function(createdEntry) {
        
        var deletedEntriesOfSameSize;
        var deletedEntriesOfSameTitle;
        var deletedEntry;

        deletedEntriesOfSameSize = deletedEntries.filter(function(deletedEntry) {
          return deletedEntry.size === createdEntry.size;
        });

        deletedEntriesOfSameTitle = deletedEntries.filter(function(deletedEntry) {
          return deletedEntry.title === createdEntry.title;
        });

        if (deletedEntriesOfSameSize.length === 1)  {
          deletedEntry = deletedEntriesOfSameSize.pop();
        } else if (deletedEntriesOfSameTitle.length === 1) {
          deletedEntry = deletedEntriesOfSameTitle.pop();
        } else {
          return;
        }

        deletedEntries = deletedEntries.filter(function(entry) {
          return deletedEntry.path !== entry.path;
        });

        renames[createdEntry.path] = {
          createdEntry: createdEntry,
          deletedEntry: deletedEntry
        };
      });

      async.eachOfSeries(
        renames,
        function(rename, deletedPath, next) {
          var createdEntry = rename.createdEntry;
          var deletedEntry = rename.deletedEntry;
          var updates = {
            url: deletedEntry.url,
            created: deletedEntry.created,
            guid: deletedEntry.guid
          };

          // we need to make sure the date stamp updates too?
          // we need to rethink entry / build so that entries
          // with metadata removed revert to original created?
          if (deletedEntry.dateStamp === deletedEntry.created)
            updates.dateStamp = deletedEntry.dateStamp;

          console.log(
            "Blog:",
            blogID,
            "Entry rename detected:",
            "\n (deleted)",
            deletedEntry.path,
            "\n (created)",
            createdEntry.path
          );

          Entry.set(blogID, createdEntry.path, updates, next);
        },
        callback
      );
    });
  });
};
