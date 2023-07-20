# Verify4js-issuer
Verify4js-issuer нь сертификат, диплом, дансны хуулга зэрэг бичиг баримтыг блокчэйн дээр
баталгаажуулж өгөх https://github.com/corex-mn/certify-sc ухаалаг гэрээтэй харьцдаг javascript хэлний сан юм.

- Тестнэт -тэй холбогдох нөүд: `https://node-testnet.teo.mn`
- Теснэт дээрх ухаалаг гэрээний хаяг: `0xcc546a88db1af7d250a2f20dee42ec436f99e075`


- Майннэт -тэй холбогдох нөүд: `https://node.teo.mn`
- Майннэт дээрх ухаалаг гэрээний хаяг: `0x5d305D8423c0f07bEaf15ba6a5264e0c88fC41B4`


## Суулгах заавар
```shell
npm install verify4js-issuer
```
```shell
yarn add verify4js-issuer
```

## Функцүүд
### `issuePdf`
PDF файлын хаш утгыг тооцож ухаалаг гэрээнд бичээд,
гүйлгээний мэдээлэл болон нэмэлт мэдээллүүдийг файлын мэтадата дээр нэмэн шинэ файлд хадгална.

Байгуулагчийн параметр:

| Параметр                   | Тайлбар                                    | Заавал эсэх |
|----------------------------|--------------------------------------------|-------------|
| `smartContractAddress` | Ухаалаг гэрээний хаяг                      | тийм        |
| `nodeHost`      | Гүйлгээ хийх блокчэйний нөүдний хаяг       | тийм        |
| `issuerAddress`           | Баталгаажуулагчийн хаяг                    | тийм        |
| `issuerName`              | Баталгаажуулагчийн нэр                     | тийм        |
| `chainId`                 | Баталгаажуулагчийн нэр                     | үгүй        |
| `hashType`                | Хашийн төрөл                               | үгүй        |

`issuePdf` функцийн параметр:

| Параметр                | Тайлбар                              | Заавал эсэх                                     |
|-------------------------|--------------------------------------|-------------------------------------------------|
| `id`                    | Файлын ID                            | тийм                                            |
| `sourceFilePath`      | PDF эх файлын зам                    | тийм                                            |
| `destinationFilePath` | Мэтадата бичсэн PDF-ийг хадгалах зам | тийм                                            |
| `expireDate`           | Дуусах хугацаа                       | үгүй                                            |
| `desc`                  | Тайлбар, нэмэлт мэдээлэл             | үгүй                                            |
| `additionalInfo`       | Мэтадата дээр орох нэмэлт мэдээлэл   | үгүй                                            |
| `privateKey`           | Баталгаажуулагчийн хувийн түлхүүр    | үгүй /key_store, passphrase өгөөгүй бол заавал/ |
| `keyStore`             | Хувийн түлхүүрийн keystore файл      | үгүй /private_key өгөөгүй бол заавал/           |
| `passphrase`            | Хувийн түлхүүрийн passphrase файл    | үгүй /private_key өгөөгүй бол заавал/           |


#### Жишээ
```js
import {PdfIssuer} from "verify4js-issuer";

const issuer = new PdfIssuer(
    '0xCc546a88Db1aF7d250a2F20Dee42eC436F99e075', 
    'https://node-testnet.teo.mn',
    '0x89995e30DAB8E3F9113e216EEB2f44f6B8eb5730',
    'test', 3305);

issuer.issuePdf('test',
    '/home/user/sample.pdf',
    '/home/user/sample_res.pdf',
    0, 
    'test', '',
    'private_key'
).then(console.log).catch(e => {
        console.error(e.message);
})
```

### `RevokePDF`
Нэгэнт ухаалаг гэрээнд баталгаажсан PDF файлыг буцаан хүчингүй болгох функц

Байгуулагчийн параметр:

| Параметр                   | Тайлбар                                    | Заавал эсэх |
|----------------------------|--------------------------------------------|-------------|
| `smartContractAddress` | Ухаалаг гэрээний хаяг                      | тийм        |
| `nodeHost`      | Гүйлгээ хийх блокчэйний нөүдний хаяг       | тийм        |
| `issuerAddress`           | Баталгаажуулагчийн хаяг                    | тийм        |
| `issuerName`              | Баталгаажуулагчийн нэр                     | тийм        |
| `chainId`                 | Баталгаажуулагчийн нэр                     | үгүй        |
| `hashType`                | Хашийн төрөл                               | үгүй        |


`revokePdf` функцийн параметр:

| Параметр       | Тайлбар                           | Заавал эсэх                                     |
|----------------|-----------------------------------|-------------------------------------------------|
| `filePath`    | Мэтадата бичигдсэн PDF файлын зам | тийм                                            |
| `revokerName` | Хүчингүй болгож буй хүний нэр     | тийм                                            |
| `privateKey`  | Баталгаажуулагчийн хувийн түлхүүр | үгүй /key_store, passphrase өгөөгүй бол заавал/ |
| `keyStore`    | Хувийн түлхүүрийн key_store файл  | үгүй /private_key өгөөгүй бол заавал/           |
| `passphrase`   | Хувийн түлхүүрийн passphrase файл | үгүй /private_key өгөөгүй бол заавал/           |

#### Жишээ
```js
import {PdfIssuer} from "verify4js-issuer";

const issuer = new PdfIssuer(
    '0xCc546a88Db1aF7d250a2F20Dee42eC436F99e075',
    'https://node-testnet.teo.mn',
    '0x89995e30DAB8E3F9113e216EEB2f44f6B8eb5730',
    'test', 3305);

issuer.revokePdf(
    '/home/user/sample_res.pdf',
    'test_user',
    'private key'
).then(console.log).catch(e => {
  console.error(e.message);
})

```
