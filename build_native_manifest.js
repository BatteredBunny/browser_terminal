const fs = require('fs');

let manifest ={
    "name": "browser_terminal",
    "description": "Allows you to open a native shell in the browser",
    "path": __dirname + "/native/app.py",
    "type": "stdio",
    "allowed_extensions": [ "browser_terminal@example.org" ]
}

fs.writeFileSync(manifest.name + '.json', JSON.stringify(manifest));