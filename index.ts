import {PdfIssuer} from "verify4js-issuer";

const PdfIssuer = require('./dist/PdfIssuer');
const issuer = new PdfIssuer.PdfIssuer('0xCc546a88Db1aF7d250a2F20Dee42eC436F99e075', 'https://node-testnet.teo.mn',
    '0x89995e30DAB8E3F9113e216EEB2f44f6B8eb5730', 'test', 3305);

issuer.issuePdf('test',
    '/home/surenbayar/Downloads/sample.pdf',
    '/home/surenbayar/Downloads/test_res.pdf',
    0, 'test', '',
    'a737d20b2e2a001bbf54c7edfcbffb015b0e67924e20f561c238ddaad6c4ed0e'
).then(console.log).catch(e => {
        console.error(e.message);
})

issuer.revokePdf(
    '/home/surenbayar/Downloads/test_res.pdf',
    'suugii',
    'a737d20b2e2a001bbf54c7edfcbffb015b0e67924e20f561c238ddaad6c4ed0e'
).then(console.log).catch(e => {
    console.error(e.message);
})

//
// issuer.revoke('test11115', 'test', 'a737d20b2e2a001bbf54c7edfcbffb015b0e67924e20f561c238ddaad6c4ed0e').then(console.log).catch((e) => {
//     console.error(e.message);
// });
