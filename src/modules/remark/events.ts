import { Dispatcher, MessageContext } from "@mtcute/dispatcher";
import { html } from "@mtcute/html-parser";

import i18n from "../../i18n/index.ts";
import { dmFilter, isAdmin, isDMWithAdmin } from "../../filters.ts";
import {
  RemarkActionButton,
  RemarkListButton,
  RemarkStaticButton,
  RemarkUserInfoButton,
  RemarkUsersByBadgeButton,
} from "./keyboard.ts";
import { RemarkAdmin } from "./view.ts";
import { RemarkService } from "./service.ts";
import { extractMemberFromText } from "../../extractor.ts";
import { UserService } from "../user/service.ts";

const BADGE_FLOW_TIMEOUT = 5 * 60_000; // 5 minutes

type RemarkCreatePendingFlow = {
  kind: "create";
  expiresAt: number;
};

type RemarkActionPendingFlow = {
  kind: "addToUser" | "takeoffRemark";
  remarkId: number;
  expiresAt: number;
};

type RemarkPendingFlow = RemarkCreatePendingFlow | RemarkActionPendingFlow;

const remarkPendingFlow = new Map<number, RemarkPendingFlow>();

const getPendingFlow = (adminId: number): RemarkPendingFlow | undefined => {
  const pending = remarkPendingFlow.get(adminId);
  if (!pending) {
    return undefined;
  }

  if (pending.expiresAt <= Date.now()) {
    remarkPendingFlow.delete(adminId);
    return undefined;
  }

  return pending;
};

const startCreateFlow = (adminId: number) => {
  remarkPendingFlow.set(adminId, {
    kind: "create",
    expiresAt: Date.now() + BADGE_FLOW_TIMEOUT,
  });
};

const startRemarkActionFlow = (
  adminId: number,
  remarkId: number,
  kind: "addToUser" | "takeoffRemark",
) => {
  remarkPendingFlow.set(adminId, {
    kind,
    remarkId,
    expiresAt: Date.now() + BADGE_FLOW_TIMEOUT,
  });
};

export function registerRemarkButtons(dp: Dispatcher) {
  dp.onCallbackQuery(RemarkListButton.filter({}), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const offset = Number.parseInt(upd.match.offset, 10) || 0;
    const view = await RemarkAdmin.getList(offset);
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({
      text: view.message,
      replyMarkup: view.keyboard,
    });
  });

  dp.onCallbackQuery(RemarkStaticButton.filter({ action: "back" }), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    const view = await RemarkAdmin.getList();
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({
      text: view.message,
      replyMarkup: view.keyboard,
    });
  });

  dp.onCallbackQuery(RemarkStaticButton.filter({ action: "create" }), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    await upd.client.sendText(upd.user, i18n.userCustomRemarkAdmin.createHelpInfo);
    startCreateFlow(upd.user.id);
  });

  dp.onCallbackQuery(RemarkActionButton.filter({ action: "add_to_user" }), async (upd) => {
    const remarkId = Number(upd.match.id);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || Number.isNaN(remarkId)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const remark = await RemarkService.get(remarkId);
    if (!remark) {
      return await upd.answer({
        text: i18n.userCustomRemarkAdmin.remarkNotFound,
      });
    }

    await upd.answer({});
    await upd.client.sendText(upd.user, i18n.userCustomRemarkAdmin.sendUserInfo);
    startRemarkActionFlow(upd.user.id, remark.id, "addToUser");
  });

  dp.onCallbackQuery(RemarkActionButton.filter({ action: "takeoff_remark" }), async (upd) => {
    const remarkId = Number(upd.match.id);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || Number.isNaN(remarkId)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const remark = await RemarkService.get(remarkId);
    if (!remark) {
      return await upd.answer({
        text: i18n.userCustomRemarkAdmin.remarkNotFound,
      });
    }

    await upd.answer({});
    await upd.client.sendText(upd.user, i18n.userCustomRemarkAdmin.sendUserInfo);
    startRemarkActionFlow(upd.user.id, remark.id, "takeoffRemark");
  });

  dp.onCallbackQuery(RemarkUsersByBadgeButton.filter({}), async (upd) => {
    const remarkId = Number(upd.match.remarkId);
    const offset = Number(upd.match.offset);
    if (
      !isDMWithAdmin(upd.chat.id, upd.user.id) ||
      Number.isNaN(remarkId) ||
      Number.isNaN(offset)
    ) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    const view = await RemarkAdmin.getUserListByBadge(remarkId, offset);
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({ text: view.message, replyMarkup: view.keyboard });
  });

  dp.onCallbackQuery(RemarkActionButton.filter({ action: "delete_remark" }), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const remarkId = Number(upd.match.id);
    if (Number.isNaN(remarkId)) {
      return await upd.answer({
        text: i18n.userCustomRemarkAdmin.remarkNotFound,
      });
    }
    const remark = await RemarkService.get(remarkId);
    if (!remark) {
      return await upd.answer({
        text: i18n.userCustomRemarkAdmin.remarkNotFound,
      });
    }

    await upd.answer({});
    await RemarkService.delete(remarkId);

    const view = await RemarkAdmin.getList();
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({ text: view.message, replyMarkup: view.keyboard });
  });

  dp.onCallbackQuery(RemarkActionButton.filter({ action: "view" }), async (upd) => {
    await upd.answer({});
    const remarkId = Number(upd.match.id);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || Number.isNaN(remarkId)) {
      return;
    }

    const view = await RemarkAdmin.getBadgeInfo(remarkId);
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({
      text: view.message,
      replyMarkup: view.keyboard,
    });
  });

  dp.onCallbackQuery(RemarkUserInfoButton.filter({}), async (upd) => {
    await upd.answer({});
    const userId = upd.match.id;
    const offset = Number(upd.match.offset ?? 0);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !userId) {
      return;
    }

    const view = await RemarkAdmin.getUserInfo(Number(userId), offset);
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({
      text: view.message,
      replyMarkup: view.keyboard,
    });
  });
}

async function handleCreateBadgeInput(
  _: RemarkPendingFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  remarkPendingFlow.delete(adminId);

  try {
    const result = await RemarkService.create(text);
    if (!result) {
      throw new Error("Result not found in DB");
    }

    await msg.answerText(`${i18n.userCustomRemarkAdmin.remarkCreated}. ID: ${result.id}`);
  } catch (error) {
    console.error("Failed to create custom remark, because", error);
    await msg.answerText(i18n.userCustomRemarkAdmin.failedToCreateTryAgain);
  }

  return true;
}

async function handleAddToUserInput(
  pending: RemarkActionPendingFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  const selectedUser = extractMemberFromText(text);
  if (!selectedUser) {
    await msg.answerText(i18n.userCustomRemarkAdmin.invalidUserId);
    return true;
  }

  remarkPendingFlow.delete(adminId);

  try {
    await msg.answerText(i18n.shared.thinking);
    const remarkInfo = await RemarkService.get(pending.remarkId);
    if (!remarkInfo) {
      await msg.answerText(i18n.userCustomRemarkAdmin.remarkNotFound);
      return true;
    }

    const user = await UserService.get(selectedUser);
    if (!user) {
      await msg.answerText(i18n.userCustomRemarkAdmin.invalidUserId);
      return true;
    }

    const result = await RemarkService.setToUser(user.id, pending.remarkId);
    if (!result) {
      throw new Error("Failed to set remark to user");
    }

    const username = user.username ?? `<unnamed>`;
    await msg.answerText(
      html`${i18n.userCustomRemarkAdmin.remarkAssigned}: ${remarkInfo.name} (ID:
        ${String(remarkInfo.id)}) → <a href="${user.link}">${username}</a> (ID: ${String(user.id)})`,
    );
  } catch (error) {
    console.error("Failed to add custom remark to user, because", error);
    await msg.answerText(i18n.userCustomRemarkAdmin.failedToAssignTryAgain);
  }

  return true;
}

async function handleTakeoffBadgeInput(
  pending: RemarkActionPendingFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  const selectedUser = extractMemberFromText(text);
  if (!selectedUser) {
    await msg.answerText(i18n.userCustomRemarkAdmin.invalidUserId);
    return true;
  }

  remarkPendingFlow.delete(adminId);

  try {
    await msg.answerText(i18n.shared.thinking);
    const remarkInfo = await RemarkService.get(pending.remarkId);
    if (!remarkInfo) {
      await msg.answerText(i18n.userCustomRemarkAdmin.remarkNotFound);
      return true;
    }

    const user = await UserService.get(selectedUser);
    if (!user) {
      await msg.answerText(i18n.userCustomRemarkAdmin.invalidUserId);
      return true;
    }

    await RemarkService.removeFromUser(user.id, pending.remarkId);
    const username = user.username ?? `<unnamed>`;
    await msg.answerText(
      html`${i18n.userCustomRemarkAdmin.remarkTakenOff}: ${remarkInfo.name} (ID:
        ${String(remarkInfo.id)}) → <a href="${user.link}">${username}</a> (ID: ${String(user.id)})`,
    );
  } catch (error) {
    console.error("Failed to take off custom remark from user, because", error);
    await msg.answerText(i18n.userCustomRemarkAdmin.failedToAssignTryAgain);
  }

  return true;
}

export async function handleBadgeInput(msg: MessageContext): Promise<boolean> {
  const adminId = msg.sender.id;
  if (!dmFilter(msg) || !isAdmin(adminId)) {
    return false;
  }

  const pending = getPendingFlow(adminId);
  if (!pending) {
    return false;
  }

  if (msg.isService || msg.media) {
    return false;
  }

  const text = msg.text.trim();
  if (/^\/cancel(?:@\w+)?$/i.test(text)) {
    remarkPendingFlow.delete(adminId);
    await msg.answerText(i18n.userCustomRemarkAdmin.actionCanceled);
    return true;
  }

  if (!text || text.startsWith("/")) {
    return false;
  }

  switch (pending.kind) {
    case "create":
      await handleCreateBadgeInput(pending, adminId, text, msg);
      break;
    case "addToUser":
      await handleAddToUserInput(pending, adminId, text, msg);
      break;
    case "takeoffRemark":
      await handleTakeoffBadgeInput(pending, adminId, text, msg);
      break;
  }

  return true;
}
