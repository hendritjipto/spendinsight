import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

dotenv.config();

let parsedData;
async function fetchData() {
fs.readFile('userdatasample.json', 'utf8', (err, filedata) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  try {
    parsedData = JSON.parse(filedata);
    
    console.log("Name:", parsedData[0].name);
    console.log("Bank Account Number:", parsedData[0].bankAccountNumber);
    //console.log("Coordinates:", parsedData.location.coordinates);
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
});
}


const TEST_DURATION_MS = 1000; // 1 minute
const CONCURRENCY = 10; // Number of parallel requests per batch
//const QUERY = 'bankAccountNumber=6320971361&month=2025-03-01';

const BASE_URL_1 = 'http://localhost:8081/api/transaction';
//const BASE_URL_2 = 'http://localhost:8080/api/transaction/pg';

async function getRandomBankAccountNumber(data) {

  // Check if there is any data
  if (!data || data.length === 0) {
    return null;
  }
  
  // Select a random index from the array length
  const randomIndex = Math.floor(Math.random() * data.length);
  
  // Return the bank account number of the randomly selected object
  return data[randomIndex].bankAccountNumber;
}

async function sendRequest(url) {
    try {
        const res = await fetch(url);
        return res.ok; // only count successful responses
    } catch (err) {
        return false;
    }
}

async function runBenchmark(url) {
    const endTime = Date.now() + TEST_DURATION_MS;
    let successfulRequests = 0;

    while (Date.now() < endTime) {
        let account = getRandomBankAccountNumber(parsedData);
        let QUERY = 'bankAccountNumber='+account +'&month=2025-03-01';
        console.log(QUERY);
        const batch = Array.from({ length: CONCURRENCY }, () => sendRequest(`${url}?${QUERY}`));
        const results = await Promise.allSettled(batch);
        //console.log(results);
        successfulRequests += results.filter(r => r.status === 'fulfilled' && r.value).length;
    }

    return successfulRequests;
}

async function benchmark() {
    console.log('Benchmarking API 1...');
    const api1QPS = await runBenchmark(BASE_URL_1);
    console.log('Benchmarking API 2...');
    //const api2QPS = await runBenchmark(BASE_URL_2);

    const qpsResults = {
        api1: api1QPS / (TEST_DURATION_MS / 1000),
        //api2: api2QPS / (TEST_DURATION_MS / 1000)
    };

    console.log('Benchmark complete:', qpsResults);
    await generateBarChart(qpsResults);
}

async function generateBarChart(qpsResults) {
    const width = 600;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const config = {
        type: 'bar',
        data: {
            labels: ['MongoDB (/insight)', 'PostgreSQL (/transaction/pg)'],
            datasets: [{
                label: 'Queries Per Second (QPS)',
                data: [qpsResults.api1, qpsResults.api2],
                backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'API Benchmark: Queries Per Second',
                    font: { size: 18 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'QPS' }
                }
            }
        },
        plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }]
    };

    const image = await chartJSNodeCanvas.renderToBuffer(config);
    fs.writeFileSync('qps-benchmark.png', image);
    console.log('QPS chart saved as qps-benchmark.png');
}

await fetchData();
let result = await getRandomBankAccountNumber(parsedData);
console.log("rslt" + result);
//await benchmark();
