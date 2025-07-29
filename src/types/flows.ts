export type Flow = {
	id: string;
	title: string;
	bio?: string;
	created_at: string;
	updated_at?: string;
	cover_photo_url?: string;
	cover_photo_blurhash?: string;
	tags?: string[];
	last_activity?: string;
	moment_count?: number;
	unread_count?: number;
	role?: 'owner' | 'member';
	owner_id?: string;
	is_shared?: boolean;
};