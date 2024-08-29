import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";

export function createCsvZip(data) {
    const files = [];

    Object.keys(data).forEach((key) => {
        if (data[key] && data[key].length > 0) {
            files.push({
                name: 'hpd-testdata_' + key + '.csv',
                content: parseCSV(data[key])
            });
        }
    });

    const zipWriter = new ZipWriter(new BlobWriter());
    return Promise.all(
        files.map((file) => zipWriter.add(
            file.name, 
            new TextReader(file.content)
        ))
    ).then(() => {
        return zipWriter.close().then((closed) => {
            return closed;
        });
    });
}

function parseCSV(data, separator = ',') {
    const reducer = (existing, added, i) => {
        return i === 1
            ? '"' + existing + '"' + separator + '"' + added + '"'
            : existing + separator + '"' + added + '"';
    };

    const keys = Object.keys(data[0]);

    // write title row
    let str = keys.reduce(reducer) + '\n';

    // write data rows
    data.forEach((dataset, i) => {
        let row = '';
        keys.forEach((key, j) => {
            const value = dataset[key] == undefined ? '' : dataset[key];
            row += '"' + value + '"' + (j === keys.length - 1 ? '' : separator);
        });
        str += row + (i === data.length - 1 ? '' : '\n');
    });

    return str;
}