async function fetchData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      // Use the fetched data to update the DOM
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  // Example: Creating a new data item
  async function createData(newData) {
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });
      const data = await response.json();
      // Handle the response, e.g., update the UI
    } catch (error) {
      console.error('Error creating data:', error);
    }
  }