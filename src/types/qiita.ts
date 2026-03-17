export interface QiitaTag {
  name: string;
}

export interface QiitaUser {
  id: string;
  profile_image_url: string;
}

export interface QiitaArticle {
  id: string;
  title: string;
  url: string;
  created_at: string;
  likes_count: number;
  tags: QiitaTag[];
  user: QiitaUser;
}
