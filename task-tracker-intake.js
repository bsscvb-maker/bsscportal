'use strict';

{
  const get = id => document.getElementById(id);
  const scopes = [...document.querySelectorAll('[data-work-scope]')];
  const priorityLabels = { tier1: 'High', tier2: 'Medium', tier3: 'Low' };
  const sharedStates = { ready: 'Not started', working: 'In progress', waiting: 'Waiting', done: 'Completed' };
  const intakeStates = ['Needs review', 'Open', 'Done', 'Dismissed'];
  let scope = 'active';
  let intake = [];
  let intakeError = '';
  let intakeLoading = false;

  function make(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function service() {
    if (window.parent === window || !window.parent.taskIntake) return null;
    return window.parent.taskIntake;
  }

  function sharedItems() {
    return tasks.map(task => {
      const details = meta(task);
      const status = statusOf(task);
      return {
        title: task.text, notes: details.notes, owner: details.owner, project: details.project,
        updates: details.updates || [],
        priority: tierOf(task), due: details.due, status: sharedStates[status],
        complete: status === 'done', review: details.needsReview === true, task
      };
    });
  }

  function inScope(item, filter = scope) {
    if (item.status === 'Dismissed') return false;
    if (filter === 'complete') return item.complete;
    if (item.complete) return false;
    if (filter === 'review') return item.review;
    if (filter === 'overdue') return Boolean(item.due && item.due < dateKey());
    return true;
  }

  function compare(a, b) {
    const sort = get('workSort').value;
    if (sort === 'title') return a.title.localeCompare(b.title);
    const byDue = (a.due || '9999').localeCompare(b.due || '9999');
    if (sort === 'due') return byDue || a.title.localeCompare(b.title);
    return Number(inScope(b, 'overdue')) - Number(inScope(a, 'overdue'))
      || Number(b.review) - Number(a.review)
      || (a.priority || 'tier4').localeCompare(b.priority || 'tier4')
      || byDue || a.title.localeCompare(b.title);
  }

  function renderWork() {
    const items = [...sharedItems(), ...intake];
    const counts = Object.fromEntries(scopes.map(button => {
      const filter = button.dataset.workScope;
      return [filter, items.filter(item => inScope(item, filter)).length];
    }));
    get('workSummary').textContent = busy && !ready ? 'Loading tasks…'
      : counts.active + ' active · ' + counts.review + ' need review';
    get('workNew').disabled = busy || !ready;
    get('workRefresh').disabled = busy || intakeLoading;
    for (const button of scopes) {
      const filter = button.dataset.workScope;
      button.setAttribute('aria-pressed', String(filter === scope));
      button.querySelector('span').textContent = counts[filter];
    }

    const query = get('workSearch').value.trim().toLowerCase();
    const priority = get('workPriority').value;
    const visible = items.filter(item => inScope(item)
      && (!priority || item.priority === priority)
      && [item.title, item.notes, item.owner, item.project].filter(Boolean).join(' ').toLowerCase().includes(query)
    ).sort(compare);

    const results = get('workResults');
    results.replaceChildren();
    if (!visible.length) {
      const message = busy || intakeLoading ? 'Loading tasks…' : 'No tasks match this view.';
      results.append(make('p', message, 'work-empty'));
      return;
    }
    for (const item of visible) results.append(taskRow(item));
  }

  function showError(message) {
    const feedback = get('workFeedback');
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  function statusChanged() {
    const message = get('message');
    showError([message.classList.contains('error') ? message.textContent : '', intakeError].filter(Boolean).join(' '));
    renderWork();
  }

  function sourceDetails(item) {
    const details = make('details', '', 'work-source');
    details.append(make('summary', 'Source details'));
    details.append(make('p', item.source || 'Added in Task Tracker'));
    if (/^https:\/\//i.test(item.link)) {
      const link = make('a', 'Open original');
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      details.append(link);
    }
    return details;
  }

  async function saveIntake(item, status) {
    try {
      await service().setStatus(item.id, status);
      item.status = status;
      item.complete = status === 'Done';
      item.review = status === 'Needs review';
      renderWork();
      return true;
    } catch (error) {
      showError(error.message);
      return false;
    }
  }

  function openDetails(item) {
    get('workDetailTitle').textContent = item.title;
    const body = get('workDetailBody');
    body.replaceChildren(make('p', [item.status, item.owner || 'Unassigned', item.due ? dateLabel(item.due) : 'No due date'].join(' · ')));
    if (item.notes) body.append(make('p', item.notes));
    if (item.updates?.length) {
      const updates = make('details', '', 'work-source');
      updates.append(make('summary', 'Progress notes (' + item.updates.length + ')'));
      for (const update of [...item.updates].reverse()) {
        updates.append(make('p', noteStamp(update.at) + ' · ' + update.text));
      }
      body.append(updates);
    }
    if (item.task) {
      const edit = make('button', 'Edit task');
      edit.onclick = () => { get('workDetails').close(); open(item.task); };
      const addNote = make('button', 'Add note');
      addNote.onclick = () => { get('workDetails').close(); openNote(item.task); };
      body.append(edit, addNote);
    } else {
      const label = make('label', 'Status ');
      const select = document.createElement('select');
      intakeStates.forEach(state => select.add(new Option(state)));
      select.value = item.status;
      select.onchange = async () => {
        select.disabled = true;
        if (await saveIntake(item, select.value)) get('workDetails').close();
        else { select.value = item.status; select.disabled = false; }
      };
      label.append(select);
      body.append(label);
    }
    if (item.task) {
      const links = meta(item.task).links;
      if (links?.length) body.append(...links.map(link => sourceDetails({ link, source: 'Task attachment' })));
    } else {
      body.append(sourceDetails(item));
    }
    get('workDetails').showModal();
  }

  function taskRow(item) {
    const row = make('article', '', 'work-row');
    const done = make('button', item.complete ? '✓' : '', 'work-complete');
    done.type = 'button';
    done.disabled = item.task ? busy || !ready : false;
    done.setAttribute('aria-label', (item.complete ? 'Reopen ' : 'Complete ') + item.title);
    done.onclick = async () => {
      done.disabled = true;
      if (item.task) await updateStatus(item.task, item.complete ? 'ready' : 'done');
      else if (!await saveIntake(item, item.complete ? 'Open' : 'Done')) done.disabled = false;
    };

    const text = make('div', '', 'work-task-text');
    const title = make('button', item.title, 'work-title');
    title.onclick = () => openDetails(item);
    text.append(title);
    const context = [item.project, item.owner].filter(Boolean);
    if (context.length) text.append(make('span', context.join(' · '), 'work-context'));

    const due = make('span', item.due ? dateLabel(item.due) : '—', 'work-due');
    if (inScope(item, 'overdue')) {
      due.classList.add('work-late');
      due.textContent = 'Overdue · ' + due.textContent;
    }
    const priority = make('span', priorityLabels[item.priority] || '—', 'work-priority');
    if (item.priority) priority.dataset.priority = item.priority;
    const status = make('span', item.review && !item.complete ? 'Needs review' : item.status, 'work-state');
    status.dataset.state = item.complete ? 'complete' : item.review ? 'review' : 'active';
    const more = make('button', 'Details', 'work-more');
    more.onclick = () => openDetails(item);

    row.append(done, text, due, priority, status, more);
    return row;
  }

  async function refreshIntake() {
    const api = service();
    if (!api || intakeLoading) return;
    intakeLoading = true;
    renderWork();
    try {
      const rows = await api.read();
      const unique = new Map();
      for (const [id, source, title, owner, due, link, status] of rows) {
        if (!id || !title || unique.has(id)) continue;
        unique.set(id, { id, source, title, owner, due, link, status, review: status === 'Needs review', complete: status === 'Done' });
      }
      intake = [...unique.values()];
      intakeError = '';
    } catch (error) {
      intakeError = 'Could not load incoming tasks. ' + error.message;
    } finally {
      intakeLoading = false;
      statusChanged();
    }
  }

  const refreshWork = () => Promise.all([load(), refreshIntake()]);
  get('workRefresh').onclick = refreshWork;
  get('workNew').onclick = () => open();
  get('workClose').onclick = () => get('workDetails').close();
  get('workSearch').oninput = renderWork;
  get('workPriority').onchange = renderWork;
  get('workSort').onchange = renderWork;
  for (const button of scopes) {
    button.onclick = () => { scope = button.dataset.workScope; renderWork(); };
  }

  new MutationObserver(statusChanged).observe(get('message'), { attributes: true, childList: true, subtree: true });
  render = () => { fillOptions(); renderWork(); };
  get('legacyTracker').hidden = true;
  get('workDashboard').hidden = false;
  if (window.parent !== window) {
    document.documentElement.classList.add('tracker-embedded');
    get('workDashboard').querySelector('h1').textContent = 'Work queue';
  }
  renderWork();
  refreshIntake();
}
