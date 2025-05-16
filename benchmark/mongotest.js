import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';

dotenv.config();

const RUNS = 100;

const results = {
    api1: [],
    api2: []
};

const BASE_URL_1 = 'http://localhost:8080/api/insight'; //MongoDB
const BASE_URL_2 = 'http://localhost:8080/api/transaction/pg'; //PostgreSQL
const QUERY = 'bankAccountNumber=6320971361&month=2025-03-01';

async function benchmarkApiRequest1() {
    // let url = `${BASE_URL_1}?${QUERY}`;
    // console.log(url);
    for (let i = 0; i < RUNS; i++) {
        const start = performance.now();
        const res = await fetch(`${BASE_URL_1}?${QUERY}`);
        let result;
        if (res.headers.get('content-type')?.includes('application/json')) {
            result = await res.json();
            //console.log(result);
        } else {
            result = await res.text(); // read as text for non-JSON responses
            //console.log(result);
        }
        const end = performance.now();
        results.api1.push(end - start);
    }
}

async function benchmarkApiRequest2() {
    //let url = `${BASE_URL_2}?${QUERY}`;
    //console.log(url);
    for (let i = 0; i < RUNS; i++) {
        const start = performance.now();
        const res = await fetch(`${BASE_URL_2}?${QUERY}`);
        let result;
        if (res.headers.get('content-type')?.includes('application/json')) {
            result = await res.json();
            //console.log(result);
        } else {
            result = await res.text(); // read as text for non-JSON responses
            //console.log(result);
        }
        const end = performance.now();
        results.api2.push(end - start); //postgreSQL
    }
}

async function generateChart() {
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    if (results.api1.length > 0) results.api1.shift();
    if (results.api2.length > 0) results.api2.shift();

    const config = {
        type: 'line',
        data: {
            labels: Array.from({ length: RUNS }, (_, i) => i + 1),
            datasets: [
                {
                    label: 'API /api/insight (ms)',
                    data: results.api1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'API /api/transaction/pg (ms)',
                    data: results.api2,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'REST API Benchmark: /api/transaction/pg vs /api/insight',
                    font: { size: 18 }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Run Number' } },
                y: { title: { display: true, text: 'Execution Time (ms)' }, beginAtZero: true }
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
    fs.writeFileSync('benchmark-chart.png', image);
    console.log('Chart saved as benchmark-chart.png');
}

async function generateDifferenceChart() {
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const differences = results.api1.map((a1, i) => a1 - results.api2[i]);

    const config = {
        type: 'line',
        data: {
            labels: Array.from({ length: RUNS }, (_, i) => i + 1),
            datasets: [{
                label: 'API /transaction - /insight Difference (ms)',
                data: differences,
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Time Difference Between Two API Endpoints',
                    font: { size: 18 }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Run Number' } },
                y: { title: { display: true, text: 'Time Difference (ms)' }, beginAtZero: true }
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
    fs.writeFileSync('difference-chart.png', image);
    console.log('Difference chart saved as difference-chart.png');
}

await benchmarkApiRequest1();
await benchmarkApiRequest2();
console.log('Benchmarking complete. Generating chart...');
await generateChart();
await generateDifferenceChart();
