const chat = document.querySelector('#chat');
const chineseScenarios = {
  dinner: {
    guest: '两个人，1 万日元以内，想喝啤酒，不吃生鱼。',
    reply: '明白。先来一份适合分享的晚餐吧，给你留一点追加的余地。',
    items: [['生啤酒 × 2', 1200], ['烧鸟拼盘 × 1', 1800], ['烤牛肉 × 1', 2800], ['玉子烧 × 1', 800], ['烤饭团 × 2', 600]],
    action: '确认这份推荐 · 演示',
    result: '已演示确认步骤。未来订单将在系统成功接收后反馈结果；本页未发送任何订单。'
  },
  extra: {
    guest: '刚才的烧鸟很好吃，再来一份。',
    reply: '再追加一份烧鸟拼盘，示例价格 ¥1,800。确认后才会提交，需要这份吗？',
    items: [['烧鸟拼盘 × 1', 1800]],
    action: '确认追加 · 演示',
    result: '已演示追加确认。真实产品将保留本桌订单记录，供客人与店员核对；本页未发送订单。'
  },
  staff: {
    guest: '麻烦请店员过来一下。',
    reply: '好的，这个需求交给店员。未来会带上你的桌号，让店员知道去哪里帮忙。',
    items: null,
    action: '查看呼叫结果 · 演示',
    result: '演示结束：8 号桌需要店员协助。本页没有连接餐厅，未实际呼叫店员。'
  }
};
const locale = document.documentElement.lang === 'zh-CN' ? 'zh' : document.documentElement.lang === 'en' ? 'en' : 'ja';
const translations = {
  zh: { label: '本次推荐 / 示例价格', total: '示例合计', done: '已完成演示 ✓', scenarios: chineseScenarios },
  ja: {
    label: '今回のおすすめ / 価格は一例です', total: '合計（例）', done: 'デモ完了 ✓',
    scenarios: {
      dinner: {
        guest: 'ふたりで、予算は 1 万円以内。ビールを飲みたいです。生魚はなしで。',
        reply: 'かしこまりました。シェアしやすい料理はいかがですか。追加注文の余裕も残してご提案します。',
        items: [['生ビール × 2',1200],['焼き鳥盛り合わせ × 1',1800],['牛肉のグリル × 1',2800],['玉子焼き × 1',800],['焼きおにぎり × 2',600]],
        action: 'この内容を確認する · デモ',
        result: '確認のステップを体験しました。実際の注文はシステムでの受信後に結果をお知らせする想定です。このページから注文は送信されていません。'
      },
      extra: {
        guest: 'さっきの焼き鳥、おいしかった。もう一皿お願いします。',
        reply: '焼き鳥盛り合わせをもう一皿ですね。価格例は 1,800 円です。内容を確認してから送信する想定です。よろしいですか？',
        items: [['焼き鳥盛り合わせ × 1',1800]], action: '追加内容を確認する · デモ',
        result: '追加注文の確認デモが完了しました。実際の製品では、お客様と店員が照合できる注文履歴を残す想定です。このページから注文は送信されていません。'
      },
      staff: {
        guest: '店員さんを呼んでもらえますか？',
        reply: 'はい、店員への取り次ぎですね。実際の製品では、テーブル番号と一緒にお知らせする想定です。',
        items: null, action: '呼び出しの表示を見る · デモ',
        result: 'デモ完了：8 番テーブルに店員の対応が必要です。このページは店舗に接続されておらず、実際の呼び出しは行っていません。'
      }
    }
  },
  en: {
    label: 'OUR SUGGESTION / EXAMPLE PRICES', total: 'Example total', done: 'Demo complete ✓',
    scenarios: {
      dinner: {
        guest: 'Two people, under ¥10,000. We’d like beer, but no raw fish.',
        reply: 'How about a few dishes to share? This suggestion leaves a little room in your budget for another round.',
        items: [['Draft beer × 2',1200],['Yakitori platter × 1',1800],['Grilled beef × 1',2800],['Japanese omelet × 1',800],['Grilled rice balls × 2',600]],
        action: 'Confirm this suggestion · Demo',
        result: 'You’ve tried the confirmation step. A real order would be acknowledged after the system receives it. This page has not sent an order.'
      },
      extra: {
        guest: 'That yakitori was great. Could we have another platter?',
        reply: 'One more yakitori platter, at an example price of ¥1,800. An order would only be sent after you confirm. Would you like it?',
        items: [['Yakitori platter × 1',1800]], action: 'Confirm another round · Demo',
        result: 'Reorder confirmation demo complete. The planned product would keep a table order history for guests and staff to check. No order has been sent.'
      },
      staff: {
        guest: 'Could you ask a staff member to come over?',
        reply: 'Of course. In the planned product, your request would include the table number so staff know where to help.',
        items: null, action: 'View the staff request · Demo',
        result: 'Demo complete: Table 8 needs assistance. This page is not connected to a restaurant and has not called a staff member.'
      }
    }
  }
};
const copy = translations[locale];
const scenarios = copy.scenarios;
let selected = 'dinner';
function renderScenario(key) {
  selected = key;
  const scene = scenarios[key];
  chat.replaceChildren();
  for (const [role, message] of [['guest', scene.guest], ['ai', scene.reply]]) {
    const bubble = document.createElement('p');
    bubble.className = `bubble ${role}`;
    bubble.textContent = message;
    chat.append(bubble);
  }
  const order = document.createElement('div');
  order.className = 'order-preview';
  if (scene.items) {
    const label = document.createElement('strong');
    label.textContent = copy.label;
    const list = document.createElement('ul');
    let total = 0;
    scene.items.forEach(([name, amount]) => {
      total += amount;
      const row = document.createElement('li');
      const item = document.createElement('span');
      const price = document.createElement('span');
      item.textContent = name;
      price.textContent = `¥${amount.toLocaleString('ja-JP')}`;
      row.append(item, price); list.append(row);
    });
    const summary = document.createElement('div');
    summary.className = 'order-total';
    const caption = document.createElement('span'); caption.textContent = copy.total;
    const value = document.createElement('strong'); value.textContent = `¥${total.toLocaleString('ja-JP')}`;
    summary.append(caption, value); order.append(label, list, summary);
  }
  const confirm = document.createElement('button');
  confirm.className = 'demo-confirm'; confirm.type = 'button'; confirm.textContent = scene.action;
  confirm.addEventListener('click', () => {
    confirm.disabled = true; confirm.textContent = copy.done;
    const result = document.createElement('p'); result.className = 'confirmation'; result.textContent = scene.result; chat.append(result);
  });
  order.append(confirm); chat.append(order);
  document.querySelectorAll('[data-scenario]').forEach(button => {
    const active = button.dataset.scenario === key;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => renderScenario(button.dataset.scenario)));
document.querySelector('#restart').addEventListener('click', () => renderScenario(selected));
document.querySelector('#year').textContent = new Date().getFullYear();
renderScenario(selected);
document.querySelectorAll('.language-switch a').forEach(link => {
  link.addEventListener('click', () => {
    const destination = new URL(link.href);
    destination.hash = window.location.hash;
    link.href = destination.href;
  });
});
