import { LinkToView } from "../types/view";
import type { NumExtractedLink, StrExtractedLink } from "../extractor";
import { ThreadView } from "../modules/thread/view";
import { PostView } from "../modules/post/view";
import { PostCommentView } from "../modules/post-comment/view";
import { UserView } from "../modules/user/view";
import { ProfilePostView } from "../modules/profile-post/view";

export const linkToView: LinkToView<NumExtractedLink> | LinkToView<StrExtractedLink> = {
  thread: ThreadView.getInfo,
  post: PostView.getInfo,
  "post-comment": PostCommentView.getInfo,
  "profile-post": ProfilePostView.getInfo,
  member: UserView.getInfo,
  custom: UserView.getInfo,
} as const;
