import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { deleteUserArtist, getUserArtists } from '@/services/legacy/supplier';
import { IUserArtist } from '@/types';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import { BaseDialog } from '../../ui/BaseDialog';
import UserArtistModal from './UserArtistModal';

const UserArtistSetting = ({ isSetting }: any) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3); // Default to 3 items per page

  const [edit, setEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const { userArtists: data, setUserArtists: setData } = useCreateNFT();

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const currentItems = useMemo(
    () =>
      data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage],
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchUserArtists = async () => {
    const userArtists = await getUserArtists();
    setData(userArtists);
  };

  useEffect(() => {
    fetchUserArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 after changing items per page
  };

  const handleDelete = async (item: IUserArtist) => {
    try {
      await deleteUserArtist({
        id: item._id,
      });

      fetchUserArtists();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete artist',
        duration: 2000,
      });
    }
  };

  return (
    <div className="rounded-[20px] px-5 py-3 bg-[#232323]">
      <Disclosure as="div" defaultOpen={true}>
        <>
          <DisclosureButton
            className={cn(
              'flex w-full flex-col justify-between py-2 pb-3 text-left text-lg font-medium text-white text-[18px]',
              open ? 'border-b border-white/[8%]' : '',
            )}
          >
            <div className="flex w-full justify-between items-center gap-x-3">
              <Label className="font-extrabold sm:text-base text-sm  md:text-lg text-white">
                Add Artist Template
              </Label>
              <div className="flex justify-end w-max">
                <div
                  className="flex justify-end xs:justify-start items-center gap-2 xs:gap-3 cursor-pointer justify-self-end"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditUser(null);
                    setTimeout(() => {
                      setEdit(true);
                    }, 200);
                  }}
                >
                  <Image
                    quality={100}
                    src="/icons/add-new.svg"
                    className="sm:w-6 sm:h-6 w-5 h-5"
                    alt="icon"
                    width={24}
                    height={24}
                  />
                  <h2 className="text-white text-xs sm:text-sm font-extrabold font-manrope w-max">
                    Add New template
                  </h2>
                </div>
                {/* <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-white/[53%]`}
                /> */}
              </div>
            </div>
          </DisclosureButton>
          <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
            <Table>
              {/* <TableCaption>A list of your item activity.</TableCaption> */}
              <TableHeader>
                <TableRow className="border-white/[8%] font-extrabold">
                  <TableHead className="text-white font-extrabold sm:text-base text-xs xs:text-sm whitespace-nowrap">
                    No.
                  </TableHead>
                  <TableHead className="text-white font-extrabold sm:text-base text-xs xs:text-sm whitespace-nowrap">
                    Artist Name
                  </TableHead>
                  <TableHead className="text-white font-extrabold sm:text-base text-xs xs:text-sm whitespace-nowrap">
                    Action
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item: any, index: number) => {
                  return (
                    <TableRow
                      key={itemsPerPage * (currentPage - 1) + index + 1}
                      className="border-white/[8%] font-normal azeret-mono-font"
                    >
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-x-2 items-center">
                          <div className="text-white sm:text-base text-xs xs:text-sm font-normal azeret-mono-font leading-snug">
                            {itemsPerPage * (currentPage - 1) + index + 1}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white sm:text-base text-xs xs:text-sm font-semibold azeret-mono-font leading-snug">
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => {
                              setEditUser(item);
                              setTimeout(() => {
                                setEdit(true);
                              }, 200);
                            }}
                          >
                            <Image
                              quality={100}
                              src="/icons/edit.svg"
                              className="w-6 h-6"
                              alt="icon"
                              width={24}
                              height={24}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="w-6 h-6 relative cursor-pointer"
                          onClick={() => {
                            handleDelete(item);
                          }}
                        >
                          <Image
                            quality={100}
                            src="/icons/trash.svg"
                            className="w-6 h-6"
                            alt="icon"
                            width={24}
                            height={24}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {/* <div className="w-full h-auto px-6 pb-6 bg-dark-800 rounded-xl flex flex-col justify-start items-start gap-8">
              <div className="w-full pt-6 flex justify-between items-start gap-3">
                <div className="w-[15%] text-white text-sm font-extrabold font-manrope">
                  No.
                </div>
                <div className="w-[50%] text-white text-sm font-extrabold font-manrope">
                  Artist Name
                </div>
                <div className="w-[35%] text-white text-sm font-extrabold font-manrope">
                  Action
                </div>
              </div>
              <div className="w-full h-px opacity-10 bg-white"></div>

              {currentItems.map((item, index) => (
                <div
                  key={itemsPerPage * (currentPage - 1) + index + 1}
                  className="w-full flex justify-start items-center gap-3"
                >
                  <div className="w-[15%] flex items-center gap-1">
                    <div className="text-white text-sm font-normal font-['Azeret Mono'] leading-snug">
                      {itemsPerPage * (currentPage - 1) + index + 1}
                    </div>
                  </div>
                  <div className="w-[50%] flex items-center gap-4">
                    <div className="text-white text-sm font-semibold font-['Azeret Mono'] leading-snug">
                      {item.name}
                    </div>
                  </div>
                  <div className="w-[35%] flex items-center gap-2">
                    <div
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => {
                        setEditUser(item);
                        setTimeout(() => {
                          setEdit(true);
                        }, 200);
                      }}
                    >
                      <img src="/icons/edit.svg" className="w-6 h-6" />
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 relative cursor-pointer"
                    onClick={() => {
                      handleDelete(item);
                    }}
                  >
                    <img src="/icons/trash.svg" className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div> */}
            <BaseDialog
              isOpen={edit}
              onClose={(val) => {
                setEdit(val);
              }}
              className="bg-[#111111] xl:min-w-[1200px] 2xl:min-w-[1400px] max-h-[80%] w-full overflow-y-auto overflow-x-hidden"
            >
              <UserArtistModal editUser={editUser} />
            </BaseDialog>
            {/* Pagination */}
            <div className="flex justify-between flex-col gap-y-3 sm:gap-y-0 sm:flex-row lg:justify-center relative items-center w-full mt-4 mb-3.5">
              <div className="flex items-center gap-2 relative lg:absolute top-0 left-0">
                {/* Dropdown for items per page */}
                <span className="text-white/[35%] sm:text-[15px] text-xs xs:text-sm font-medium">
                  Showing
                </span>
                <div className="border bg-transparent border-white/30 pr-3 rounded-md">
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border-0 p-1 bg-transparent focus:ring-0 text-white focus:border-0 focus:outline-none"
                  >
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <span className="text-white/[35%] sm:text-[15px] text-xs xs:text-sm font-medium">
                  of 50
                </span>
              </div>
              <div className="flex gap-2">
                {/* First and Previous */}
                <button
                  onClick={() => handlePageChange(1)}
                  className="w-8 h-8 p-2.5 bg-[#232323] border border-white/[7%] rounded-lg flex justify-center items-center"
                >
                  «
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-8 h-8 p-2.5 bg-[#232323] border border-white/[7%] rounded-lg flex justify-center items-center"
                >
                  ‹
                </button>

                {/* Current Page Number */}
                <div className="w-8 h-8 p-2.5 bg-[#404040] rounded-lg flex justify-center items-center">
                  <div className="text-white text-sm font-semibold">
                    {currentPage}
                  </div>
                </div>

                {/* Next and Last */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-8 h-8 p-2.5 bg-[#232323] border border-white/[7%] rounded-lg flex justify-center items-center"
                >
                  ›
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 p-2.5 bg-[#232323] border border-white/[7%] rounded-lg flex justify-center items-center"
                >
                  »
                </button>
              </div>
            </div>
          </DisclosurePanel>
        </>
      </Disclosure>
    </div>
    // <div className="h-auto p-6 bg-[#232323] rounded-2xl flex flex-col justify-start items-start gap-3">
    //   <div className="w-full py-3 flex justify-between items-start gap-5">
    //     <div className="flex-grow text-white text-xl font-extrabold font-manrope">
    //       Add Properties Template
    //     </div>
    //     <div
    //       className="flex justify-start items-center gap-3 cursor-pointer"
    //       onClick={() => {
    //         setEditUser(null);
    //         setTimeout(() => {
    //           setEdit(true);
    //         }, 200);
    //       }}
    //     >
    //       <img src="/icons/add-new.svg" className="w-6 h-6" />
    //       <div className="text-white text-xl font-extrabold font-manrope">
    //         Add New template
    //       </div>
    //     </div>
    //   </div>

    //   <div className="w-full h-px opacity-10 bg-white"></div>

    // </div>
  );
};

export default UserArtistSetting;
