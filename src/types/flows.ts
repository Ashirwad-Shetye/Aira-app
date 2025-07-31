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
	role?: 'owner' | 'member' | "pending";
	owner_id?: string;
	members?: SharedFlowMembers[]
	type?: 'personal' | 'shared' | 'couple';
};

export type SharedFlowMembers = {
	id: string,
	email: string,
	role: 'owner' | 'member' | "pending";
	avatar_url?: string
}