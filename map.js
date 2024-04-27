const width = document.querySelector('#map').clientWidth;
const height = 500;
let casesByCountry;
const svg = d3.select('#map').attr('width', width).attr('height', height);
const projection = d3.geoNaturalEarth1().scale(width / 6).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const colorScale = d3.scaleLog().range(['#FFFB46', '#542344']).interpolate(d3.interpolateHcl);

d3.json('https://raw.githubusercontent.com/Uthkarshh/Task-8/main/world.GeoJSON').then(function (world) {
    renderMap(world);
    d3.select('#year-select').on('change', function () { updateMap(world); });
    d3.select('#metric-select').on('change', function () { updateMap(world); });
});

function renderMap(world) {
    svg.selectAll('.country').data(world.features).enter().append('path').attr('class', 'country')
        .attr('d', path).attr('fill', '#ccc')
        .on('mouseover', (event, d) => showTooltip(d))
        .on('mousemove', (event) => moveTooltip(event))
        .on('mouseout', hideTooltip);
    updateMap(world); // Initial update
}

function updateMap(world) {
    const year = d3.select('#year-select').node().value;
    const metric = d3.select('#metric-select').node().value;
    d3.csv('https://raw.githubusercontent.com/Uthkarshh/Task-8/main/Covid%20Data.csv', function (d) {
        const date = new Date(d.date);
        return date.getFullYear().toString() === year ? d : null;
    }).then(function (data) {
        casesByCountry = d3.rollup(data, (v) => d3.mean(v, (d) => +d[metric]), (d) => d.iso_code);
        const maxCases = d3.max(Array.from(casesByCountry.values()));
        colorScale.domain([1, maxCases]);
        svg.selectAll('.country').transition().duration(500).attr('fill', (d) => {
            const cases = casesByCountry.get(d.id);
            return cases ? colorScale(cases) : '#ccc';
        });
    });
}

function showTooltip(d) {
    const countryData = casesByCountry.get(d.id) || 'No data';
    d3.select('.tooltip').html(`${d.properties.name}: ${countryData}`).style('display', 'block');
}

function moveTooltip(event) {
    const [x, y] = d3.pointer(event);
    d3.select('.tooltip').style('left', `${x + 20}px`).style('top', `${y + 20}px`);
}

function hideTooltip() {
    d3.select('.tooltip').style('display', 'none');
}