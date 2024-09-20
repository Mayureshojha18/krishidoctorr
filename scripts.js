document.addEventListener('DOMContentLoaded', () => {
    // Get chart contexts
    const cropsChartCtx = document.getElementById('cropsChart').getContext('2d');
    const diseaseChartCtx = document.getElementById('diseaseChart').getContext('2d');
    const diseaseRequestChartCtx = document.getElementById('diseaseRequestChart').getContext('2d');

    // Define crop labels and data
    const cropLabels = [
        'Rice', 'Sorghum', 'Pistachio', 'Mango', 'Maize', 'Bean', 'Pea', 'Manioc', 'Pigeonpea', 
        'Tobacco', 'Onion', 'Cherry', 'Carrot', 'Papaya', 'Grape', 'Pomegranate', 'Turmeric', 
        'Sugarbeet', 'Rose', 'Peanut', 'Ginger', 'Apple', 'Banana', 'Cotton', 'Potato', 'Peach', 
        'Pumpkin', 'Soybean', 'Coffee', 'Eggplant', 'Sugarcane', 'Almond', 'Pepper', 'Cucumber', 
        'Pear', 'Barley', 'Citrus', 'Cauliflower', 'Guava', 'Cabbage', 'Bitter gourd', 
        'Strawberry', 'Melon', 'Millet', 'Tomato', 'Okra', 'Gram', 'Olive', 'Canola', 'Zucchini', 
        'Apricot', 'Wheat', 'Chickpea'
    ];

    const cropData = [
        558, 2, 5, 75, 151, 113, 20, 1, 4, 18, 61, 4, 10, 54, 10, 17, 14, 8, 44, 7, 
        20, 89, 90, 16, 186, 1, 59, 40, 36, 111, 25, 3, 272, 348, 1, 16, 164, 245, 
        34, 40, 100, 21, 15, 19, 1265, 49, 2, 2, 22, 40, 6, 49, 9
    ];

    // Populate crops table
    function populateCropsTable() {
        const cropsTableBody = document.getElementById('cropsTableBody');
        cropsTableBody.innerHTML = ''; // Clear existing data

        cropLabels.forEach((crop, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${crop}</td>
                <td>${cropData[index]}</td>
            `;
            cropsTableBody.appendChild(row);
        });
    }

    populateCropsTable();

    // Initialize crops chart
    const cropsChart = new Chart(cropsChartCtx, {
        type: 'doughnut',
        data: {
            labels: cropLabels,
            datasets: [{
                label: 'Crops',
                data: cropData,
                backgroundColor: cropLabels.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`) // Random colors
            }]
        },
        options: {
            onClick: (e, activeEls) => {
                if (activeEls.length > 0) {
                    const chart = activeEls[0]._chart;
                    const activePoint = chart.getElementAtEvent(e)[0];
                    const crop = chart.data.labels[activePoint._index];
                    updateDiseaseChartFromCrops(crop.toLowerCase().replace(' ', ''));
                }
            }
        }
    });

    // Initialize disease data with 80% identified accuracy
    let diseaseData = {};
    cropLabels.forEach((crop, index) => {
        const totalDiseases = cropData[index];
        const identifiedDiseases = Math.round(totalDiseases * 0.8); // 80% identified
        const notIdentifiedDiseases = totalDiseases - identifiedDiseases;
        diseaseData[crop.toLowerCase().replace(' ', '')] = [notIdentifiedDiseases, identifiedDiseases];
    });

    // Initialize disease chart with default data
    const diseaseChart = new Chart(diseaseChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Not Identified', 'Identified'],
            datasets: [{
                label: 'Disease',
                data: diseaseData['tomato'], // Default data for 'tomato'
                backgroundColor: ['#36A2EB', '#4BC0C0']
            }]
        }
    });

    // Populate disease select dropdown
    const diseaseSelect = document.getElementById('diseaseSelect');
    cropLabels.forEach(crop => {
        const option = document.createElement('option');
        option.value = crop.toLowerCase().replace(' ', '');
        option.text = crop;
        diseaseSelect.add(option);
    });

    // Update disease chart based on selected crop
    window.updateDiseaseChart = function() {
        const selectedDisease = document.getElementById('diseaseSelect').value;
        diseaseChart.data.datasets[0].data = diseaseData[selectedDisease];
        diseaseChart.update();
    };

    window.updateDiseaseChartFromCrops = function(crop) {
        document.getElementById('diseaseSelect').value = crop;
        updateDiseaseChart();
    };

    // Disease Request Chart (with new aggregation logic for daily, weekly, monthly)
    function generateScanData(min, max, length) {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    // Initialize disease request chart with daily, weekly, and monthly data (total for all crops)
    const dailyScans = generateScanData(20, 30, 7);    // Total daily values (20-30) for 7 days
    const weeklyScans = generateScanData(200, 300, 7); // Total weekly values (200-300) for 7 weeks
    const monthlyScans = generateScanData(900, 1000, 7); // Total monthly values (900-1000) for 7 months

    let currentScans = dailyScans; // Start with daily scans by default

    const diseaseRequestChart = new Chart(diseaseRequestChartCtx, {
        type: 'line',
        data: {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Default to daily labels
            datasets: [{
                label: 'Disease Requests (Total)',
                data: currentScans,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        }
    });

    // Update disease request chart based on time filter (daily, weekly, monthly)
    window.updateTimeFilter = function(filter) {
        const buttons = document.querySelectorAll('.time-filter button');
        buttons.forEach(button => button.classList.remove('active'));
        document.querySelector(`.time-filter button[onclick="updateTimeFilter('${filter}')"]`).classList.add('active');

        // Update the labels and data according to the filter
        if (filter === 'daily') {
            diseaseRequestChart.data.labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            currentScans = dailyScans;
        } else if (filter === 'weekly') {
            diseaseRequestChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];
            currentScans = weeklyScans;
        } else if (filter === 'monthly') {
            diseaseRequestChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
            currentScans = monthlyScans;
        }

        diseaseRequestChart.data.datasets[0].data = currentScans;
        diseaseRequestChart.update();
    };

    // Initial setup for daily data
    updateTimeFilter('daily');

    // Pagination logic
    let currentPage = 1;
    const rowsPerPage = 10;
    const totalPages = Math.ceil(cropLabels.length / rowsPerPage);
    document.getElementById('pageNumber').textContent = currentPage;

    window.updateTable = function() {
        const tableBody = document.getElementById('cropsTableBody');
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach((row, index) => {
            row.style.display = index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage ? '' : 'none';
        });
    };

    window.nextPage = function() {
        if (currentPage < totalPages) {
            currentPage++;
            document.getElementById('pageNumber').textContent = currentPage;
            updateTable();
        }
    };

    window.prevPage = function() {
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('pageNumber').textContent = currentPage;
            updateTable();
        }
    };

    // Search functionality
    window.searchCrops = function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const tableBody = document.getElementById('cropsTableBody');
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const cropName = row.getElementsByTagName('td')[0].textContent.toLowerCase();
            row.style.display = cropName.includes(searchTerm) ? '' : 'none';
        });
    };

    // Initial table update
    updateTable();
});
