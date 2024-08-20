const port = 3000;

const http = require('http');
const fs = require('fs');
const path = require('path');
const open = require('open');

// const folderPath = path.join(__dirname, 'cur_files');
// const outputFolderPath = path.join(__dirname, 'png_files');
const folderPath = "cur-images";
const outputFolderPath = "png-images";

// create output folder dose not exists
if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
}

const writeFile = (fileName, content) => {
    try {
        // Remove the metadata from the base64 string
        const base64Data = content.replace(/^data:image\/png;base64,/, '');

        // Decode the base64 string into binary data
        const binaryData = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(path.join(outputFolderPath, fileName + ".png"), binaryData, 'binary');
        console.log('File has been written successfully.');
    } catch (err) {
        console.error('Error writing to file:', err);
    }
}

const requestHandler = async (req, res) => {
    const pathname = req.url;
    if (pathname === '/') {
        try {
            const files = fs.readdirSync(folderPath);
            const imageTags = files.map(file => {
                console.log(file);
                // Display the image
                const filePath = path.join(folderPath, file);
                const imageData = fs.readFileSync(filePath).toString('base64');
                const fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));

                writeFile(fileNameWithoutExtension, imageData);

                const imageSrc = `data:image/png;base64,${imageData}`;
                return `<div><img src="${imageSrc}" alt="${file}" /></div>`;
            }).join('');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>CUR Files to PNG</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                            gap: 10px;
                        }
                        .grid img {
                            width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <h1>CUR Files Converted to PNG</h1>
                    <div class="grid">
                        ${imageTags}
                    </div>
                </body>
                </html>
            `);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Error: ${error.message}`);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
};

const server = http.createServer(requestHandler);

server.listen(port, () => {
    console.log('Server is listening on port 3000');
    // Automatically open the browser
    open(`http://localhost:${port}/`);
});
