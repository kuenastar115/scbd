//Search Function

function slugify(title) {
      return title.trim()
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^\w\-]/g, '');
    }

    function getQueryParam(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlight(text, words) {
      let escapedWords = words.map(w => escapeRegExp(w));
      const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
      return text.replace(pattern, '<mark>$1</mark>');
    }

    const baseUrl = window.location.origin;
    const queryParam = getQueryParam('query');
    if (queryParam) {
      document.title = `${matches.length} document${matches.length !== 1 ? 's' : ''} related to ${queryParam.replace(/-/g, ' ')}`;
        }
    const queryWords = queryParam ? queryParam.toLowerCase().split('-').filter(Boolean) : [];

    const headerEl = document.getElementById('header');
    const container = document.getElementById('results');

    if (!queryParam || queryWords.length === 0) {
      headerEl.textContent = "Please enter a search query.";
      container.innerHTML = "";
      throw new Error('No query provided');
    }

    fetch('https://raw.githubusercontent.com/zie2store/tipirusak/main/public/scrbd.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            const data = results.data;

            const matches = data.filter(d => {
              const title = d.Title.toLowerCase();
              const summary = d.Summary.toLowerCase();
              return queryWords.some(q =>
                title.includes(q) || summary.includes(q)
              );
            });

            if (matches.length > 0) {
              headerEl.textContent = `${matches.length} document${matches.length !== 1 ? 's' : ''} found for '${queryParam.replace(/-/g, ' ')}'.`;
                  
              const output = matches.map(d => {
                const slug = slugify(d.Title);
                const url = `${baseUrl}/pdf.html?document=${d.ID}#${slug}`;
                const highlightedTitle = highlight(d.Title, queryWords);
                const highlightedSummary = highlight(d.Summary, queryWords);
                return `
                 <div class="related-post">
                 <div class="related-post-title">
                 <a href="${url}">${highlightedTitle}</a></div>
                    <div class="related-post-text">${highlightedSummary}
                    <hr class="post-divider">
                    </div>
                  </div>
                `;
              }).join('');

              container.innerHTML = output;
            } else {
              headerEl.textContent = `No documents found for '${queryParam.replace(/-/g, ' ')}'. But, these documents might be interesting for you.`;
              
              const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);

              const suggestions = shuffled.map(d => {
                const slug = slugify(d.Title);
                const url = `${baseUrl}/pdf.html?document=${d.ID}#${slug}`;
                return `
                  <div class="related-post">
                  <div class="related-post-title">
                  <a href="${url}">${d.Title}</a></div>
                  <div class="related-post-text">${d.Summary}
                    <hr class="post-divider">
                  </div>
               </div>
              `;
            }).join('');

            container.innerHTML = `
          
                ${suggestions}
              `;
            }
          }
        });
      })
      .catch(err => {
        console.error('Error loading search results:', err);
        container.innerHTML = '<p>Error loading search results.</p>';
      });

    document.getElementById('searchForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('searchInput').value.trim();
      if (input) {
        const query = input.toLowerCase().replace(/\s+/g, '-');
        window.location.href = `${baseUrl}/search.html?query=${query}`;
      }
    });

