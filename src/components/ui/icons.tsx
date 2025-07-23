// src/components/ui/icons.tsx
"use client";

import {
	PiSignOut as signout,
	PiCornersOut as fullscreen,
	PiCornersIn as exitFullscreen,
	PiMagnifyingGlass as search,
	PiNotebook as notebook,
	PiHouse as home,
	PiDrop as moment,
	PiCaretLeft as arrowLeft,
	PiCheck as check,
	PiTrash as trash,
	PiNotePencil as edit,
	PiPencil as pencil,
} from "react-icons/pi";
import { LuWind as flow } from "react-icons/lu";
import { GoPlus as add } from "react-icons/go";
import { RxDotsHorizontal as menuDots } from "react-icons/rx";
import { AiOutlineLoading3Quarters as loader } from "react-icons/ai";
import { TbArrowsSort as sort} from "react-icons/tb";

const Icons = {
	signout,
	search,
	notebook,
	home,
	fullscreen,
    exitFullscreen,
    flow,
	moment,
	arrowLeft,
	add,
	menuDots,
	loader,
	check,
	trash,
	edit,
	pencil,
	sort
};

export default Icons;