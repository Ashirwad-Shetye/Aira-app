export interface Flow {
	id: string;
	user_id: string;
	title: string;
    bio?: string;
    participant?: string[]
    current_writer?: string
	created_at: string;
	cover_photo_url?: string
	cover_photo_blurhash?: string
	moment_count?: number;
	last_activity?: string | null;
	tags?: string[]
}