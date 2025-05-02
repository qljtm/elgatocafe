  // Select all the buttons in the sidebar
    const buttons = document.querySelectorAll('.sidebar button');

    // Select all the menu items
    const menuItems = document.querySelectorAll('.menu-item');

    // Add event listeners to the buttons
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Get the category from the button clicked
            const category = e.target.textContent.toLowerCase();

            // Loop through all the menu items and show/hide based on category
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block'; // Show the item
                } else {
                    item.style.display = 'none'; // Hide the item
                }
            });
        });
    });
