# Spending insight 

Please create .env file on the parent folder : 
```javascript
ATLASSEARCHURI="mongodb+srv://username:password@xxx.d1fgtx1.mongodb.net/"
DBNAME="Bank"
CURRENCY="IDR"
```

#### 🚀 Sending explain output to opentelemetry exporter with Grafana Cloud
Install necessary module : 
```shell
npm install --save @opentelemetry/api
npm install --save @opentelemetry/auto-instrumentations-node
```

Please set the enviroment variable :
```shell
export OTEL_TRACES_EXPORTER="otlp" \
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-ap-southeast-1.grafana.net/otlp" \
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <<TOKEN>>"\
export OTEL_RESOURCE_ATTRIBUTES="service.name=spending-insight2,service.namespace=spendinginsight.com,deployment.environment=production" \
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os" \
NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register" \
```

For debugging run this enviroment variable : 
```shell
export OTEL_TRACES_EXPORTER="console, otlp"
export OTEL_LOG_LEVEL="debug"
```

⚠️ Run this application with this parameter : 
```shell
node --import ./instrumentation.js index.js 
```
This how it shows on the traces

![enter image description here](/assets/traces.png)


#### Explaination 

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

