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
import { FaApple as apple } from "react-icons/fa";
import { IoSettingsOutline as settings } from "react-icons/io5";
import {
	LuWind as flow,
	LuUser as user,
	LuUsers as users,
	LuGlassWater as unreadMoments,
} from "react-icons/lu";
import { GoPlus as add, GoCreditCard as billing } from "react-icons/go";
import { RxDotsHorizontal as menuDots } from "react-icons/rx";
import { AiOutlineLoading3Quarters as loader } from "react-icons/ai";
import { TbArrowsSort as sort } from "react-icons/tb";
import { AiOutlineMail as email } from "react-icons/ai";
import { FcGoogle as googleColored } from "react-icons/fc";
import { BsSend as send, BsPeopleFill as shared } from "react-icons/bs";
import { IoInfinite as couple } from "react-icons/io5";
import dynamic from "next/dynamic";
const image = dynamic(
  () => import("react-icons/fa").then(m => m.FaImage),
  { ssr: false }
);

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
	sort,
	image,
	email,
	user,
	users,
	settings,
	billing,
	googleColored,
	apple,
	send,
	unreadMoments,
	shared,
	couple
};

export default Icons;