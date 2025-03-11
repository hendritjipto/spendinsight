# Spending insight 

Please create .env file on the parent folder : 
```javascript
ATLASSEARCHURI="mongodb+srv://username:password@xxx.d1fgtx1.mongodb.net/"
DBNAME="Bank"
CURRENCY="IDR"
```

To view what is going on with transaction,please copy this code : 

```javascript
else if (bankAccountNumber && month) {     
    const transactions = await db.collection("transaction").find(pipeline).toArray();

    console.log( JSON.stringify(transactions, null, 2));

    …
    
    const output = groupTrans(transactions);

    console.log("after grouping: " +JSON.stringify(output, null, 2));

    if (output) {
}
```

