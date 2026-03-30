import { Injectable } from '@nestjs/common';

export interface Post {
  id: number;
  title: string;
  body: string;
}

@Injectable()
export class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'Next.js ile SSR Nasıl Çalışır?',
      body: 'Server-side rendering ile sayfalar sunucuda hazırlanır, kullanıcıya hazır HTML gelir.',
    },
    {
      id: 2,
      title: "Nest.js'te Dependency Injection",
      body: "Sınıflar ihtiyaç duydukları servisleri kendileri üretmez — framework inject eder.",
    },
    {
      id: 3,
      title: 'REST vs GraphQL',
      body: 'REST endpoint bazlı çalışırken GraphQL tek endpoint üzerinden esnek sorgular sunar.',
    },
  ];
  private nextId = 4;

  findAll(): Post[] {
    return this.posts;
  }

  create(dto: { title: string; body?: string }): Post {
    const post: Post = {
      id: this.nextId++,
      title: dto.title,
      body: dto.body ?? "Next.js form verisi → Nest.js API → DB'ye kaydedildi.",
    };
    this.posts.push(post);
    return post;
  }

  remove(id: number): { deleted: boolean; id: number } {
    const before = this.posts.length;
    this.posts = this.posts.filter((p) => p.id !== id);
    return { deleted: this.posts.length < before, id };
  }
}
