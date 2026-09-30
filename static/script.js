Papa.parse("crypto_data.csv", {
    download: true,
    header: true,

    complete: function(results) {

        const data = results.data;

        const table =
            document.getElementById("cryptoTable");

        table.innerHTML = "";

        data.forEach(coin => {

            if(!coin["Coin Name"]) return;

            table.innerHTML += `
            <tr>
                <td>${coin["Coin Name"]}</td>
                <td>${coin["Price"]}</td>
                <td>${coin["24h Change"]}</td>
                <td>${coin["Market Cap"]}</td>
            </tr>
            `;
        });

        document.getElementById("totalCoins")
            .innerText = data.length;
    }
});