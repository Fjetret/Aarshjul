// Hent eksisterende data fra localStorage
let data = JSON.parse(localStorage.getItem('yearWheelData')) || [];

console.log("Loaded data:", data); // Feilsøking

// Funksjon for å oppdatere tabellen på administrasjonssiden
function updateTable() {
    const tableBody = document.getElementById('adminTable').querySelector('tbody');
    tableBody.innerHTML = '';

    data.forEach((entry, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <select class="month">
                    ${['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'].map(
                        month => `<option value="${month}" ${month === entry.month ? 'selected' : ''}>${month}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <select class="type">
                    <option value="Vikar" ${entry.type === 'Vikar' ? 'selected' : ''}>Vikar</option>
                    <option value="Kunde" ${entry.type === 'Kunde' ? 'selected' : ''}>Kunde</option>
                </select>
            </td>
            <td><input type="text" class="activity" value="${entry.activity}"></td>
            <td><input type="text" class="link" value="${entry.link}"></td>
            <td><button class="deleteRow">Slett</button></td>
        `;

        row.querySelector('.deleteRow').addEventListener('click', () => {
            data.splice(index, 1);
            saveData();
            updateTable();
        });

        row.querySelector('.month').addEventListener('change', (e) => {
            entry.month = e.target.value;
            saveData();
        });

        row.querySelector('.type').addEventListener('change', (e) => {
            entry.type = e.target.value;
            saveData();
        });

        row.querySelector('.activity').addEventListener('input', (e) => {
            entry.activity = e.target.value;
            saveData();
        });

        row.querySelector('.link').addEventListener('input', (e) => {
            entry.link = e.target.value;
            saveData();
        });

        tableBody.appendChild(row);
    });
}

// Funksjon for å lagre data i localStorage
function saveData() {
    localStorage.setItem('yearWheelData', JSON.stringify(data));
    console.log("Data saved:", data); // Feilsøking
}

// Initialiser tabellen og sett opp event listeners bare hvis vi er på administrasjonssiden
if (document.getElementById('addRow')) {
    document.getElementById('addRow').addEventListener('click', () => {
        data.push({
            id: Date.now(),
            month: 'Januar',
            type: 'Vikar',
            activity: '',
            link: ''
        });
        saveData();
        updateTable();
    });

    // Initialiser tabellen
    updateTable();
}

// Funksjon for å tegne årshjulet på yearWheel.html siden
function drawYearWheel() {
    console.log("Drawing Year Wheel..."); // Feilsøking
    const svg = d3.select("#yearWheel").append("svg")
        .attr("width", 600)
        .attr("height", 600)
        .append("g")
        .attr("transform", "translate(300,300)"); // Sentrum av SVG-elementet

    const outerRadius = 200;  // Felles ytterradius for alle nivåene
    const innerRadius1 = outerRadius - 100;
    const innerRadius2 = outerRadius - 60;
    const innerRadius3 = outerRadius - 20;

    // Konfigurer buene for nivåene
    const arc1 = d3.arc()
        .innerRadius(innerRadius1)
        .outerRadius(outerRadius);

    const arc2 = d3.arc()
        .innerRadius(innerRadius2)
        .outerRadius(outerRadius);

    const arc3 = d3.arc()
        .innerRadius(innerRadius3)
        .outerRadius(outerRadius);

    const pie = d3.pie()
        .value(1)  // lik vekt for alle måneder
        .sort(null);

    // Filtrere bort rader uten måned
    const filteredData = data.filter(d => d.month);
    console.log("Filtered data for Year Wheel:", filteredData); // Feilsøking

    const uniqueMonths = [...new Set(filteredData.map(d => d.month))];
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Tegn nivå 1 (måneder)
    const arcs1 = svg.selectAll(".arc1")
        .data(pie(uniqueMonths))
        .enter().append("g")
        .attr("class", "arc1");

    arcs1.append("path")
        .attr("d", arc1)
        .attr("fill", d => color(d.data));

    arcs1.append("text")
        .attr("transform", d => {
            const [x, y] = arc1.centroid(d);
            const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) - 90;
            return `translate(${x}, ${y}) rotate(${angle})`;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.data);

    // Tegn nivå 2 (type)
    const arcs2 = svg.selectAll(".arc2")
        .data(pie(filteredData))
        .enter().append("g")
        .attr("class", "arc2");

    arcs2.append("path")
        .attr("d", arc2)
        .attr("fill", d => color(d.data.month));

    arcs2.append("text")
        .attr("transform", d => {
            const [x, y] = arc2.centroid(d);
            const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) - 90;
            return `translate(${x}, ${y}) rotate(${angle})`;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.data.type);

    // Tegn nivå 3 (aktivitet)
    const arcs3 = svg.selectAll(".arc3")
        .data(pie(filteredData))
        .enter().append("g")
        .attr("class", "arc3");

    arcs3.append("path")
        .attr("d", arc3)
        .attr("fill", d => color(d.data.month))
        .on("click", d => {
            if (d.data.link) {
                window.location.href = d.data.link;
            }
        });

    arcs3.append("text")
        .attr("transform", d => {
            const [x, y] = arc3.centroid(d);
            const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) - 90;
            return `translate(${x}, ${y}) rotate(${angle})`;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.data.activity);
}

// Kjør denne bare på yearWheel.html
if (document.getElementById('yearWheel')) {
   
