const ZipDirectory = require('zip-dir')
const FTP = require("jsftp")
const os = require("os")
const fs = require("fs")
const extract = require('extract-zip')

let ftpConfig = require("./../../../Configs/server.config")

const host = document.getElementById("host-field").value = ftpConfig.host;
const port = document.getElementById("port-field").value = ftpConfig.port;
const user = document.getElementById("user-field").value = ftpConfig.user;
const pass = document.getElementById("pass-field").value = ftpConfig.pass;
const path = document.getElementById("path-field").value = ftpConfig.backupPath;

let ftp = new FTP(ftpConfig)

createCopyButton.addEventListener("click", function () {
    createBackup(folderToCopyInput.files[0].path);
})

search.addEventListener("input", function () {

    if (search.value == "") {
        getBackupsList();
        return;
    }

    let searched = selectToArray(backupList).filter(elem => {
        return elem.match(search.value);
    })

    backupList.innerHTML = "";

    searched.forEach(element => {
        const option = document.createElement("option")
        option.innerText = element
        backupList.append(option)
    })

})

getBackupsList();

function getFolderName(path) {
    Array.prototype.last = function () {
        return this[this.length - 1]
    }

    return os.platform() == "win32" ? path.split("\\").last() : path.split("/").last()
}

function createBackup(folderToBackup) {
    const fileName = `${os.hostname()}---${getFolderName(folderToBackup)}---${new Date().toISOString()}.backup`;

    const zipOptions = {
        saveTo: fileName
    }

    ZipDirectory(folderToBackup, zipOptions, sendBackupToServer)

    function sendBackupToServer(error, buffer) {
        if (error) {
            return console.error("ERROR: Backup not created!", error)
            alert("Ошибка копирования");
        }

        const filePath = `${ftpConfig.backupPath}/${fileName}`

        ftp.put(buffer, filePath, checkUploadStatus)
        
        function checkUploadStatus(error) {
            if (error) {
                console.error("ERROR: File not uploaded to server!", error)
                alert("Ошибка загрузки");
            }
            
            alert("Копия загружена");
            getBackupsList();
        }
    }
}

function getBackupsList() {
    backupList.innerHTML = "";

    ftp.ls(ftpConfig.backupPath, function (error, list) {
        if (error) {
            return console.error(error);
        }

        list.forEach(element => {
            if (element.name.match(/\.backup$/)) {
                const option = document.createElement("option")
                option.innerText = element.name
                backupList.append(option)
            }
        });

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
    })
}

function selectToArray(x) {
    const optionVal = new Array();

    for (i = 0; i < x.length; i++) {
        optionVal.push(x.options[i].text);
    }

    return optionVal;
}

function restoreBackup() {
    ftp.get(ftpConfig.backupPath + '/' + backupList.value, backupList.value, err => {
        if (err) {
          return console.error("There was an error retrieving the file.");
        }
        console.log("File copied successfully!");
      });
}

document.getElementById("show-modal").onclick = function() {
    document.getElementById("setting-modal").style.top = "0";
}

document.getElementById("hide-modal").onclick = function() {
    const host = document.getElementById("host-field").value;
    const port = document.getElementById("port-field").value;
    const user = document.getElementById("user-field").value;
    const pass = document.getElementById("pass-field").value;
    const path = document.getElementById("path-field").value;

    ftpConfig = { host, port, user, pass, backupPath: path };

    ftp = new FTP(ftpConfig);

    fs.writeFile("./Configs/server.config.json", JSON.stringify(ftpConfig));

    document.getElementById("setting-modal").style.top = "100%";
}

function restore() {
    ftp.get(ftpConfig.backupPath + '/' + backupList.value, backupList.value, err => {
        if (err) {
            alert("Ошибка загрузки!");
          return console.error("There was an error retrieving the file.");
        }

        extract(backupList.value, {dir:  document.getElementById("restore-folder").files[0].path }, function (err) {
            if (err) {
                alert("Ошибка распаковки!");
                return console.error(err);
            }
            alert("Копия востановлена");
        })
    });
}