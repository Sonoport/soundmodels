/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @description Read contents of file
 * @requires Class APISupport
 */
define(['src/lib/core/filereader/APISupport'], function(bAPISupport) {

    /**
     * Gets a FileList object
     * @param {Object} oFileList
     */
    return function(oFileList) {

        // Check if File API is supported
        if (bAPISupport()) {

            console.log("yes!");

        }

    };

});
