import { FluentIconsProps, bundleIcon } from '@fluentui/react-icons';
import * as FluentIcon from '@fluentui/react-icons';

type FluentIcon = {
  (props: FluentIconsProps): JSX.Element;
  displayName?: string;
};

const ArrowSortIcon = bundleIcon(
  FluentIcon.ArrowSortFilled,
  FluentIcon.ArrowSortRegular,
);
const BoxIcon = bundleIcon(FluentIcon.BoxFilled, FluentIcon.BoxRegular);
const CloseIcon = bundleIcon(
  FluentIcon.DismissFilled,
  FluentIcon.DismissRegular,
);
const DocIcon = bundleIcon(
  FluentIcon.DocumentBulletListFilled,
  FluentIcon.DocumentBulletListRegular,
);
const PersonSquare = bundleIcon(
  FluentIcon.PersonSquareFilled,
  FluentIcon.PersonSquareRegular,
);
const TeamIcon = bundleIcon(
  FluentIcon.PeopleTeamFilled,
  FluentIcon.PeopleTeamRegular,
);
const SettingsIcon = bundleIcon(
  FluentIcon.SettingsFilled,
  FluentIcon.SettingsRegular,
);
const PlugConnectedIcon = bundleIcon(
  FluentIcon.PlugConnectedFilled,
  FluentIcon.PlugConnectedRegular,
);
const CopyIcon = bundleIcon(FluentIcon.CopyFilled, FluentIcon.CopyRegular);
const DeleteIcon = bundleIcon(
  FluentIcon.DeleteFilled,
  FluentIcon.DeleteRegular,
);
const EditIcon = bundleIcon(FluentIcon.EditFilled, FluentIcon.EditRegular);
const MoreHorizontalIcon = bundleIcon(
  FluentIcon.MoreHorizontalFilled,
  FluentIcon.MoreHorizontalRegular,
);
const PersonStarIcon = bundleIcon(
  FluentIcon.PersonStarFilled,
  FluentIcon.PersonStarRegular,
);
const PersonIcon = bundleIcon(
  FluentIcon.PersonFilled,
  FluentIcon.PersonRegular,
);
const PlayIcon = bundleIcon(FluentIcon.PlayFilled, FluentIcon.PlayRegular);
const PlusIcon = bundleIcon(FluentIcon.AddFilled, FluentIcon.AddRegular);
const StopIcon = bundleIcon(FluentIcon.StopFilled, FluentIcon.StopRegular);
const SaveIcon = bundleIcon(FluentIcon.SaveFilled, FluentIcon.SaveRegular);
const MoreVerticalIcon = bundleIcon(
  FluentIcon.MoreVerticalFilled,
  FluentIcon.MoreVerticalRegular,
);
const CheckmarkIcon = bundleIcon(
  FluentIcon.CheckmarkFilled,
  FluentIcon.CheckmarkRegular,
);
const ChevronUpDownIcon = bundleIcon(
  FluentIcon.ChevronUpDownFilled,
  FluentIcon.ChevronUpDownRegular,
);
const ChevronRightIcon = bundleIcon(
  FluentIcon.ChevronRightFilled,
  FluentIcon.ChevronRightRegular,
);
const ChevronDownIcon = bundleIcon(
  FluentIcon.ChevronDownFilled,
  FluentIcon.ChevronDownRegular,
);
const DocumentDatabaseIcon = bundleIcon(
  FluentIcon.DocumentDatabaseFilled,
  FluentIcon.DocumentDatabaseRegular,
);
const GanttChartIcon = bundleIcon(
  FluentIcon.GanttChartFilled,
  FluentIcon.GanttChartRegular,
);
const LinkIcon = bundleIcon(
  FluentIcon.LinkMultipleFilled,
  FluentIcon.LinkMultipleRegular,
);
const GridIcon = bundleIcon(FluentIcon.GridFilled, FluentIcon.GridRegular);
const ArrowLeftRightIcon = bundleIcon(
  FluentIcon.ArrowBidirectionalLeftRightFilled,
  FluentIcon.ArrowBidirectionalLeftRightRegular,
);
const WrenchIcon = bundleIcon(
  FluentIcon.WrenchFilled,
  FluentIcon.WrenchRegular,
);
const HomeIcon = bundleIcon(FluentIcon.HomeFilled, FluentIcon.HomeRegular);
const SendIcon = bundleIcon(FluentIcon.SendFilled, FluentIcon.SendRegular);
const ArrowExpandIcon = bundleIcon(
  FluentIcon.ArrowExpandFilled,
  FluentIcon.ArrowExpandRegular,
);
const HistoryClearIcon = bundleIcon(
  FluentIcon.HistoryDismissFilled,
  FluentIcon.HistoryDismissRegular,
);
const ReorderDotsVerticalIcon = bundleIcon(
  FluentIcon.ReOrderDotsVerticalFilled,
  FluentIcon.ReOrderDotsVerticalRegular,
);
const SignOutIcon = bundleIcon(
  FluentIcon.SignOutFilled,
  FluentIcon.SignOutRegular,
);

export type BundledIcon =
  | 'arrowExpand'
  | 'arrowLeftRight'
  | 'arrowSort'
  | 'box'
  | 'chart'
  | 'checkmark'
  | 'chevronDown'
  | 'chevronRight'
  | 'chevronUpDown'
  | 'copy'
  | 'close'
  | 'delete'
  | 'doc'
  | 'documentDatabase'
  | 'edit'
  | 'grid'
  | 'home'
  | 'historyClear'
  | 'link'
  | 'person'
  | 'personSquare'
  | 'personStar'
  | 'play'
  | 'plugConnected'
  | 'plus'
  | 'reorderDotsVertical'
  | 'save'
  | 'send'
  | 'settings'
  | 'signout'
  | 'stop'
  | 'team'
  | 'threeDotsHorizontal'
  | 'threeDotsVertical'
  | 'wrench';

const icons: Record<BundledIcon, FluentIcon> = {
  arrowExpand: ArrowExpandIcon,
  arrowLeftRight: ArrowLeftRightIcon,
  arrowSort: ArrowSortIcon,
  box: BoxIcon,
  chart: GanttChartIcon,
  checkmark: CheckmarkIcon,
  close: CloseIcon,
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  chevronUpDown: ChevronUpDownIcon,
  copy: CopyIcon,
  delete: DeleteIcon,
  doc: DocIcon,
  documentDatabase: DocumentDatabaseIcon,
  edit: EditIcon,
  grid: GridIcon,
  home: HomeIcon,
  historyClear: HistoryClearIcon,
  link: LinkIcon,
  person: PersonIcon,
  personSquare: PersonSquare,
  personStar: PersonStarIcon,
  play: PlayIcon,
  plugConnected: PlugConnectedIcon,
  plus: PlusIcon,
  reorderDotsVertical: ReorderDotsVerticalIcon,
  save: SaveIcon,
  send: SendIcon,
  signout: SignOutIcon,
  settings: SettingsIcon,
  stop: StopIcon,
  team: TeamIcon,
  threeDotsHorizontal: MoreHorizontalIcon,
  threeDotsVertical: MoreVerticalIcon,
  wrench: WrenchIcon,
};

type Props = {
  name: BundledIcon;
  size?: number;
  style?: React.CSSProperties;
};

export default function Icon({ name, size, style }: Props) {
  const Icon = icons[name];
  return (
    <Icon
      style={{
        height: size ?? undefined,
        width: size ?? undefined,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
