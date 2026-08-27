/**
 * 一事一占 · 事不过三
 * 《蒙》：初筮告，再三渎，渎则不告。
 */
(function () {
  const MAX = 3;

  function create(kind) {
    return {
      kind: kind || "yi",
      count: 0,
      max: MAX,
      rootQuestion: "",
      eventId: "",
      locked: false,
      history: []
    };
  }

  function normalize(q) {
    return String(q || "")
      .replace(/\s+/g, "")
      .replace(/[，。？?！!、：:；;“”‘’"'（）()【】]/g, "");
  }

  function ask(session, question, eventId, opts) {
    const q = String(question || "").trim();
    if (!q) return { ok: false, message: "问句不可空。问事宜专一明确。" };
    if (session.locked || session.count >= MAX) {
      session.locked = true;
      return {
        ok: false,
        message: "《蒙》曰：初筮告，再三渎，渎则不告。此事已三筮，宜观象玩辞，勿再占。"
      };
    }
    if (session.count === 0) {
      session.rootQuestion = q;
      session.eventId = eventId || "";
      session.count = 1;
      session.history.push(q);
      return { ok: true, index: 1, label: "初筮", last: false };
    }
    if (!opts || !opts.sameMatterConfirmed) {
      return { ok: false, message: "追问须确认仍为此一事。另起炉灶请重置后初筮。" };
    }
    if (eventId && session.eventId && eventId !== session.eventId) {
      return { ok: false, message: "事类已定，追问不可另换门类。另事请重置。" };
    }
    const nq = normalize(q);
    if (session.history.some((h) => normalize(h) === nq)) {
      return { ok: false, message: "同一问句不可再占。请就未明之处换一层问法。" };
    }
    if (/另[一事题]|改问|换成|另外问|新的问题|别的事/.test(q)) {
      return { ok: false, message: "此乃另事。请点击重置，另立初筮。" };
    }
    session.count += 1;
    session.history.push(q);
    const last = session.count >= MAX;
    if (last) session.locked = true;
    return {
      ok: true,
      index: session.count,
      last,
      label: session.count === 2 ? "再筮" : "三筮（末）"
    };
  }

  function seal(session) {
    session.locked = true;
  }

  window.YiSession = { create, ask, seal, MAX, normalize };
})();
