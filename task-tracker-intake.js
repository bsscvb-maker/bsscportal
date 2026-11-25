'use strict';

{
  const el = id => document.getElementById(id);
  const states = ['Needs review', 'Open', 'Done', 'Dismissed'];
  let items = [];
  let loading = false;

  function make(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function getService() {
    if (window.parent === window || !window.parent.taskIntake) {
      throw new Error('Open Task Tracker inside the signed-in Management Portal to view intake.');
    }
    return window.parent.taskIntake;
  }

  function render() {
    const results = el('intakeResults');
    results.replaceChildren();
    const source = el('intakeSource').value;
    const status = el('intakeStatus').value;
    const query = el('intakeSearch').value.trim().toLowerCase();
    const visible = items.filter(item =>
      (!source || source === item.source) &&
      (!status || status === item.status) &&
      [item.title, item.owner, item.source].join(' ').toLowerCase().includes(query)
    );
    el('intakeMessage').textContent = visible.length + (visible.length === 1 ? ' item' : ' items');
    if (!visible.length) results.append(make('p', 'No items match this view.'));
    for (const item of visible) {
      const row = make('article', '', 'intake-item');
      const detail = document.createElement('div');
      detail.append(make('span', item.source, 'intake-source'), make('h3', item.title));
      const meta = make('div', '', 'intake-meta');
      meta.append(make('span', item.owner || 'Unassigned'));
      if (item.due) meta.append(make('span', 'Due ' + item.due));
      if (/^https:\/\//i.test(item.link)) {
        const link = make('a', 'Open source');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        meta.append(link);
      }
      detail.append(meta);
      const statusSelect = document.createElement('select');
      statusSelect.setAttribute('aria-label', 'Status for ' + item.title);
      states.forEach(value => statusSelect.add(new Option(value, value)));
      statusSelect.value = item.status;
      statusSelect.onchange = async () => {
        statusSelect.disabled = true;
        try {
          await getService().setStatus(item.id, statusSelect.value);
          item.status = statusSelect.value;
          render();
        } catch (error) {
          statusSelect.value = item.status;
          el('intakeMessage').textContent = error.message;
        } finally {
          statusSelect.disabled = false;
        }
      };
      row.append(detail, statusSelect);
      results.append(row);
    }
  }

  async function refresh() {
    if (loading) return;
    loading = true;
    el('intakeRefresh').disabled = true;
    el('intakeMessage').textContent = 'Loading intake…';
    try {
      const rows = await getService().read();
      const unique = new Map();
      for (const [id, source, title, owner, due, link, status, added] of rows) {
        if (id && title && !unique.has(id)) unique.set(id, { id, source, title, owner, due, link, status: states.includes(status) ? status : states[0], added });
      }
      items = [...unique.values()].reverse();
      const input = el('intakeSource');
      const source = input.value;
      input.replaceChildren(new Option('All sources', ''));
      [...new Set(items.map(item => item.source).filter(Boolean))].sort().forEach(value => input.add(new Option(value, value)));
      if ([...input.options].some(option => option.value === source)) input.value = source;
      render();
    } catch (error) {
      items = [];
      el('intakeResults').replaceChildren();
      el('intakeMessage').textContent = error.message;
    } finally {
      loading = false;
      el('intakeRefresh').disabled = false;
    }
  }

  function showIntake(show) {
    el('sharedTab').setAttribute('aria-pressed', String(!show));
    el('intakeTab').setAttribute('aria-pressed', String(show));
    el('sharedTasks').hidden = show;
    el('intakePanel').hidden = !show;
    if (show) refresh();
  }

  el('sharedTab').onclick = () => showIntake(false);
  el('intakeTab').onclick = () => showIntake(true);
  el('intakeRefresh').onclick = refresh;
  el('intakeSource').onchange = render;
  el('intakeStatus').onchange = render;
  el('intakeSearch').oninput = render;
}
