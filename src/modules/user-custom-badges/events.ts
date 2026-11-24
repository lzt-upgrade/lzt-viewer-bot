import { Dispatcher, MessageContext } from "@mtcute/dispatcher";
import { html } from "@mtcute/html-parser";

import i18n from "../../i18n/index.ts";
import { dmFilter, isAdmin, isDMWithAdmin } from "../../filters.ts";
import {
  UserCustomBadgeActionButton,
  UserCustomBadgeListButton,
  UserCustomBadgeStaticButton,
  UserCustomBadgeUserInfoButton,
  UserCustomBadgeUserListButton,
  UserCustomBadgeUsersByBadgeButton,
} from "./keyboard";
import { UserCustomBadgeAdmin } from "./view";
import { UserCustomBadgeService } from "./service.ts";
import { extractMemberFromText } from "../../extractor.ts";
import { UserService } from "../user/service.ts";

const BADGE_FLOW_TIMEOUT = 5 * 60_000; // 5 minutes

type CreatePendingBadgeFlow = {
  kind: "create";
  expiresAt: number;
};

type AddToUserPendingBadgeFlow = {
  kind: "addToUser";
  badgeId: string;
  expiresAt: number;
};

type TakeoffBadgePendingBadgeFlow = {
  kind: "takeoffBadge";
  badgeId: string;
  expiresAt: number;
};

type PendingBadgeFlow =
  | CreatePendingBadgeFlow
  | AddToUserPendingBadgeFlow
  | TakeoffBadgePendingBadgeFlow;

const pendingBadgeFlow = new Map<number, PendingBadgeFlow>();

const getPendingFlow = (adminId: number): PendingBadgeFlow | undefined => {
  const pending = pendingBadgeFlow.get(adminId);
  if (!pending) {
    return undefined;
  }

  if (pending.expiresAt <= Date.now()) {
    pendingBadgeFlow.delete(adminId);
    return undefined;
  }

  return pending;
};

const startCreateFlow = (adminId: number) => {
  pendingBadgeFlow.set(adminId, {
    kind: "create",
    expiresAt: Date.now() + BADGE_FLOW_TIMEOUT,
  });
};

const startAddToUserFlow = (adminId: number, badgeId: string) => {
  pendingBadgeFlow.set(adminId, {
    kind: "addToUser",
    badgeId,
    expiresAt: Date.now() + BADGE_FLOW_TIMEOUT,
  });
};

const startTakeoffBadgeFlow = (adminId: number, badgeId: string) => {
  pendingBadgeFlow.set(adminId, {
    kind: "takeoffBadge",
    badgeId,
    expiresAt: Date.now() + BADGE_FLOW_TIMEOUT,
  });
};

export function registerUserCustomBadgeButtons(dp: Dispatcher) {
  dp.onCallbackQuery(UserCustomBadgeListButton.filter({}), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const offset = Number.parseInt(upd.match.offset, 10) || 0;
    const view = await UserCustomBadgeAdmin.getList(offset);
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
  dp.onCallbackQuery(UserCustomBadgeUserListButton.filter({}), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const offset = Number.parseInt(upd.match.offset, 10) || 0;
    const view = await UserCustomBadgeAdmin.getUserList(offset);
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

  dp.onCallbackQuery(UserCustomBadgeStaticButton.filter({ action: "back" }), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    const view = await UserCustomBadgeAdmin.getPanel();
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

  dp.onCallbackQuery(UserCustomBadgeStaticButton.filter({ action: "create" }), async (upd) => {
    if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    await upd.client.sendText(upd.user, i18n.userCustomBadgeAdmin.createHelpInfo);
    startCreateFlow(upd.user.id);
  });

  dp.onCallbackQuery(UserCustomBadgeActionButton.filter({ action: "add_to_user" }), async (upd) => {
    const badgeId = upd.match.id;
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !badgeId) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    const badge = badgeId ? await UserCustomBadgeService.getBadge(badgeId) : undefined;
    if (!badge) {
      return await upd.answer({
        text: i18n.userCustomBadgeAdmin.badgeNotFound,
      });
    }

    await upd.answer({});
    await upd.client.sendText(upd.user, i18n.userCustomBadgeAdmin.sendUserInfo);
    startAddToUserFlow(upd.user.id, badge.badgeId);
  });

  dp.onCallbackQuery(
    UserCustomBadgeActionButton.filter({ action: "takeoff_badge" }),
    async (upd) => {
      const badgeId = upd.match.id;
      if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !badgeId) {
        return await upd.answer({
          text: i18n.shared.forbidden,
        });
      }

      const badge = badgeId ? await UserCustomBadgeService.getBadge(badgeId) : undefined;
      if (!badge) {
        return await upd.answer({
          text: i18n.userCustomBadgeAdmin.badgeNotFound,
        });
      }

      await upd.answer({});
      await upd.client.sendText(upd.user, i18n.userCustomBadgeAdmin.sendUserInfo);
      startTakeoffBadgeFlow(upd.user.id, badge.badgeId);
    },
  );

  dp.onCallbackQuery(UserCustomBadgeUsersByBadgeButton.filter({}), async (upd) => {
    const badgeId = upd.match.badgeId;
    const offset = Number(upd.match.offset);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !badgeId || Number.isNaN(offset)) {
      return await upd.answer({
        text: i18n.shared.forbidden,
      });
    }

    await upd.answer({});
    const view = await UserCustomBadgeAdmin.getUserListByBadge(badgeId, offset);
    if (!view) {
      return await upd.answer({
        text: i18n.shared.unknownError,
      });
    }

    await upd.editMessage({ text: view.message, replyMarkup: view.keyboard });
  });

  dp.onCallbackQuery(
    UserCustomBadgeActionButton.filter({ action: "delete_badge" }),
    async (upd) => {
      if (!isDMWithAdmin(upd.chat.id, upd.user.id)) {
        return await upd.answer({
          text: i18n.shared.forbidden,
        });
      }

      const badgeId = upd.match.id;
      const badge = badgeId ? await UserCustomBadgeService.getBadge(badgeId) : undefined;
      if (!badge) {
        return await upd.answer({
          text: i18n.userCustomBadgeAdmin.badgeNotFound,
        });
      }

      await upd.answer({});
      await UserCustomBadgeService.deleteBadgeFromUsers(badge.badgeId);
      await UserCustomBadgeService.delete(badge.badgeId);

      const view = await UserCustomBadgeAdmin.getList();
      if (!view) {
        return await upd.answer({
          text: i18n.shared.unknownError,
        });
      }

      await upd.editMessage({ text: view.message, replyMarkup: view.keyboard });
    },
  );

  dp.onCallbackQuery(UserCustomBadgeActionButton.filter({ action: "view" }), async (upd) => {
    await upd.answer({});
    const badgeId = upd.match.id;
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !badgeId) {
      return;
    }

    const view = await UserCustomBadgeAdmin.getBadgeInfo(badgeId);
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

  dp.onCallbackQuery(UserCustomBadgeUserInfoButton.filter({}), async (upd) => {
    await upd.answer({});
    const userId = upd.match.id;
    const offset = Number(upd.match.offset ?? 0);
    if (!isDMWithAdmin(upd.chat.id, upd.user.id) || !userId) {
      return;
    }

    const view = await UserCustomBadgeAdmin.getUserInfo(Number(userId), offset);
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
  _: PendingBadgeFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  pendingBadgeFlow.delete(adminId);

  try {
    const result = await UserCustomBadgeService.create(text);
    if (!result) {
      throw new Error("Result not found in DB");
    }

    await msg.answerText(`${i18n.userCustomBadgeAdmin.badgeCreated}. ID: ${result.badgeId}`);
  } catch (error) {
    console.error("Failed to create custom badge, because", error);
    await msg.answerText(i18n.userCustomBadgeAdmin.failedToCreateTryAgain);
  }

  return true;
}

async function handleAddToUserInput(
  pending: AddToUserPendingBadgeFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  const selectedUser = extractMemberFromText(text);
  if (!selectedUser) {
    await msg.answerText(i18n.userCustomBadgeAdmin.invalidUserId);
    return true;
  }

  pendingBadgeFlow.delete(adminId);

  try {
    await msg.answerText(i18n.shared.thinking);
    const user = await UserService.get(selectedUser);
    if (!user) {
      await msg.answerText(i18n.userCustomBadgeAdmin.invalidUserId);
      return true;
    }

    const badge = await UserCustomBadgeService.addToUser(user.id, pending.badgeId);
    await msg.answerText(
      badge
        ? html`${i18n.userCustomBadgeAdmin.badgeAssigned}: ${badge.text} (ID: ${badge.badgeId}) →
            <a href="${user.link}">${user.username ?? `<unnamed>`}</a> (ID: ${String(user.id)})`
        : i18n.userCustomBadgeAdmin.badgeNotFound,
    );
  } catch (error) {
    console.error("Failed to add custom badge to user, because", error);
    await msg.answerText(i18n.userCustomBadgeAdmin.failedToAssignTryAgain);
  }

  return true;
}

async function handleTakeoffBadgeInput(
  pending: TakeoffBadgePendingBadgeFlow,
  adminId: number,
  text: string,
  msg: MessageContext,
) {
  const selectedUser = extractMemberFromText(text);
  if (!selectedUser) {
    await msg.answerText(i18n.userCustomBadgeAdmin.invalidUserId);
    return true;
  }

  pendingBadgeFlow.delete(adminId);

  try {
    await msg.answerText(i18n.shared.thinking);
    const user = await UserService.get(selectedUser);
    if (!user) {
      await msg.answerText(i18n.userCustomBadgeAdmin.invalidUserId);
      return true;
    }

    const result = await UserCustomBadgeService.takeoffFromUser(user.id, pending.badgeId);
    await msg.answerText(
      result ? i18n.userCustomBadgeAdmin.badgeTakenOff : i18n.userCustomBadgeAdmin.badgeNotFound,
    );
  } catch (error) {
    console.error("Failed to take off custom badge from user, because", error);
    await msg.answerText(i18n.userCustomBadgeAdmin.failedToAssignTryAgain);
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
    pendingBadgeFlow.delete(adminId);
    await msg.answerText(i18n.userCustomBadgeAdmin.actionCanceled);
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
    case "takeoffBadge":
      await handleTakeoffBadgeInput(pending, adminId, text, msg);
      break;
  }

  return true;
}
