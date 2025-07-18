export interface Flow {
	id: string;
	user_id: string;
	title: string;
    bio?: string;
    participant?: string[]
    current_writer?: string
	created_at: string;
}