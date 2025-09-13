document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('darkModeToggle');

  // Apply saved theme
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggle.textContent = '☀️';
  }

  // Toggle dark mode on click
  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    toggle.textContent = isDark ? '☀️' : '🌓';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  });

  // Wallet checker function (make global)
  window.checkNFTs = async function(pageKey) {
    const wallet = document.getElementById("wallet").value.trim();
    const results = document.getElementById("results");
    const debug = document.getElementById("debug");

    if (!wallet) {
      results.innerHTML = "Please enter a wallet address.";
      return;
    }

    results.innerHTML = "Checking...";
    debug.textContent = "";

    try {
      let url = `https://eth-mainnet.g.alchemy.com/nft/v2/BWgsxPuacgw5Tvb8VClPY/getNFTs?owner=${wallet}&contractAddresses[]=0x65c234d041f9ef96e2f126263727dfa582206d82&withMetadata=true`;
      if (pageKey) url += `&pageKey=${pageKey}`;

      const res = await fetch(url);

      // Handle non-JSON responses gracefully
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        results.innerHTML = "Error: " + text;
        console.error("Non-JSON response:", text);
        return;
      }

      results.innerHTML = "";
      if (data.ownedNfts && data.ownedNfts.length > 0) {
        data.ownedNfts.forEach(nft => {
          const tokenId = parseInt(nft.id.tokenId, 16);
          const div = document.createElement("div");
          div.className = "nft";
          const openSeaLink = `https://opensea.io/assets/ethereum/0x65c234d041f9ef96e2f126263727dfa582206d82/${tokenId}`;
          div.innerHTML = `
            ${nft.media?.[0]?.gateway ? `<a href="${openSeaLink}" target="_blank"><img src="${nft.media[0].gateway}" alt="NFT image"></a>` : ""}
            <p>Token ID: ${tokenId}</p>
          `;
          results.appendChild(div);
        });

        if (data.pageKey) {
          const nextBtn = document.createElement("button");
          nextBtn.textContent = "Load More";
          nextBtn.onclick = () => checkNFTs(data.pageKey);
          results.appendChild(nextBtn);
        }
      } else {
        results.innerHTML = "<p style='text-align:center;color:#777;'>No Rabbitars owned.</p>";
      }
    } catch (err) {
      results.innerHTML = "Error: " + err;
      console.error(err);
    }
  };
});
