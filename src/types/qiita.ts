export type QiitaTag = {
  name: string;
};

export type QiitaUser = {
  id: string;
  profile_image_url: string;
};

export type QiitaArticle = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  likes_count: number;
  tags: QiitaTag[];
  user: QiitaUser;
};
