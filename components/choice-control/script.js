(function () {
  const form = document.getElementById('choiceForm');
  const checkCount = document.getElementById('checkCount');
  const summaryTopics = document.getElementById('summaryTopics');
  const summaryView = document.getElementById('summaryView');
  const summaryPrefs = document.getElementById('summaryPrefs');

  function valuesOf(name, selector) {
    return Array.from(form.querySelectorAll(selector || `input[name="${name}"]:checked`))
      .map(i => i.value);
  }

  function render() {
    const topics = valuesOf('topic');
    checkCount.textContent = `已选 ${topics.length} 项`;
    summaryTopics.innerHTML = topics.length
      ? `方向：${topics.map(v => `<strong>${v}</strong>`).join('、')}`
      : '方向：未选择';

    const view = form.querySelector('input[name="view"]:checked');
    summaryView.innerHTML = `视图：<strong>${view ? view.value : '未选择'}</strong>`;

    const prefs = valuesOf('prefs');
    summaryPrefs.innerHTML = prefs.length
      ? `开关：${prefs.map(v => `<strong>${v}</strong>`).join('、')}`
      : '开关：全部关闭';
  }

  form.addEventListener('change', render);
  render();
})();
