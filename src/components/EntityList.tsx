import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import { showAlert } from '../components/tosterComponents/tost';
import { Formik, Form, Field, ErrorMessage } from 'formik';

interface Person {
  _id: string;
  name: string;
  userName: string;
  colour: string;
  count: string;
  tokenNumber: string;
  email: string;
  contactNumber: string;
  date: string;
}

interface Range {
  _id: string;
  startRange: number;
  endRange: number;
  color: string;
  date: string;
}

interface FormData {
  searchTerm: string;
  dateFilter: string;
}

const validationSchema = Yup.object().shape({
  searchTerm: Yup.string().matches(
    /^[0-9]+$/,
    'Search term must contain only numbers',
  ),
  dateFilter: Yup.string(), // You can add validation for the dateFilter here if needed
});

const Entries: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);

  const [serialNumber, setSerialNumber] = useState<number>(1);

  const [rangeList, setRangeList] = useState<Range[]>([]);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [reFetch, setReFetch] = useState<boolean>(false);

  const [noRecordsFound, setNoRecordsFound] = useState<boolean>(false);

  // const { register, handleSubmit, formState: { errors } } = useForm({
  //   resolver: yupResolver(
  //     Yup.object().shape({
  //       searchTerm: Yup.string().matches(
  //         /^[0-9]+$/,
  //         'Search term must contain only numbers',
  //       ),
  //       dateFilter: Yup.string(),
  //     }),
  //   ),
  // });

  // const onSubmit = async (data: { searchTerm: string; dateFilter?: string })=> {
  //   try {
  //     const token = data?.searchTerm;
  //     const dateFilter = data?.dateFilter;
  //     const formattedDate = dateFilter ? formatDate(dateFilter) : undefined;

  //     const tokenObj = {
  //       tokenNumber: token,

  //       dateFilter: formattedDate,
  //     };

  //     const res = await axios.get<any>(
  //       'http://localhost:5000/api/admin/search-list-entity',
  //       { params: tokenObj },
  //     );

  //     if (res.data && res.data.list !== undefined) {
  //       const { list, totalCount } = res.data;

  //       if (Array.isArray(list) && totalCount !== undefined) {
  //         setPeople(list);
  //         setTotalCount(totalCount);
  //         setNoRecordsFound(list.length === 0);
  //       } else {
  //         console.error('Invalid list format or totalCount:', list, totalCount);
  //         setNoRecordsFound(true);
  //       }
  //     } else {
  //       console.error('Invalid response format:', res);
  //       setNoRecordsFound(true);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setNoRecordsFound(true);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responsePeople = await axios.get<any>(
          'http://localhost:5000/api/admin/list-entity',
        );

        const responseRange = await axios.get<any>(
          'http://localhost:5000/api/admin/enitity-rang-list',
        );

        if (
          responsePeople.data.status === 'success' &&
          responseRange.data.status === 'success'
        ) {
          const peopleList = responsePeople.data.list || [];
          const rangeListData = responseRange.data.rangeList || [];
          const totalCountData = responsePeople.data.totalCount || 0;

          setPeople(peopleList);
          setRangeList(rangeListData);
          setTotalCount(totalCountData);
        } else {
          console.error(
            'API request failed with status:',
            responsePeople.data.status,
            responseRange.data.status,
          );
          setNoRecordsFound(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNoRecordsFound(true);
      }
    };

    fetchData();
  }, [reFetch]);

  const formatDate = (dateString: string) => {
    const dateObject = new Date(dateString);

    const year = dateObject.getFullYear();

    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based

    const day = dateObject.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  };

  const deleteEntry = async (id: any) => {
    if (window.confirm('Are you sure you want to delete ?')) {
      try {
        const response = await axios.post(
          'http://localhost:5000/api/admin/delete-entity-admin',
          { id },
        );

        if (response.data.status === 'success') {
          setReFetch((prev) => !prev);
          showAlert('User Entry Deleted successfully!', 'success');
        }
      } catch (error) {
        console.error('Error making API call:', error);
      }
    }
  };

  const handleSubmit = async (values: FormData) => {
    try {
      console.log(values);

      const token = values.searchTerm;
      const dateFilter = values.dateFilter;
      const formattedDate = dateFilter ? formatDate(dateFilter) : undefined;

      let tokenObj: { tokenNumber?: string; dateFilter?: string } = {};

      if (token) tokenObj.tokenNumber = token;
      if (dateFilter) tokenObj.dateFilter = dateFilter;

      console.log(tokenObj);

      const res = await axios.get(
        'http://localhost:5000/api/admin/search-list-entity',
        {
          params: tokenObj,
        },
      );

      if (res.data && res.data.list !== undefined) {
        const { list, totalCount } = res.data;
        if (Array.isArray(list) && totalCount !== undefined) {
          setPeople(list);
          setTotalCount(totalCount);
          setNoRecordsFound(list.length === 0);
        } else {
          console.error('Invalid list format or totalCount:', list, totalCount);
          setNoRecordsFound(true);
        }
      } else {
        console.error('Invalid response format:', res);
        setNoRecordsFound(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setNoRecordsFound(true);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-4 ">
          <Formik
            initialValues={{ searchTerm: '', dateFilter: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="flex">
                  <div className="mb-4 ">
                    <Field
                      type="text"
                      name="searchTerm"
                      placeholder="Type token to search..."
                      // className="bg-transparent pr-4 pl-9 focus:outline-none"
                      className="bg-transparent pl-9 mt-2 focus:outline-none"
                    />
                    <ErrorMessage
                      name="searchTerm"
                      component="div"
                      className="text-red-500 mt-2"
                    />
                  </div>

                  <div className="mb-4">
                    <Field
                      type="date"
                      name="dateFilter"
                      placeholder="Select date..."
                      className="bg-transparent pl-9 mt-2 focus:outline-none"
                    />
                    {/* You can add error messages for dateFilter if needed */}
                  </div>
                  <div className="mb-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-transparent pl-9 mt-2 focus:outline-none"
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="pr-2"
                      />
                      Submit
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
          {/* <form onSubmit={handleSubmit((data) => onSubmit(data))}> */}
          {/* <form onSubmit={handleSubmit((data) => onSubmit(data))}>

            <div className="relative">
              <input
                type="text"
                placeholder="Type token to search..."
                {...register('searchTerm')}
                className="bg-transparent pr-4 pl-9 focus:outline-none"
              />
              <input
                type="date"
                placeholder="Select date..."
                {...register('dateFilter')}
                className="bg-transparent pl-9 mt-2 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute top-1/2 left-0 -translate-y-1/2"
              >
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>
            </div>
            {errors.searchTerm && (
              <div className="text-red-500 mt-2">
                {errors.searchTerm.message}
              </div>
            )}
          </form> */}
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-9 p-2.5">
            <h5 className="hidden text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Sl No
            </h5>
            <h5 className="text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Agent Name
            </h5>
            <h5 className="text-sm font-medium uppercase xsm:text-base text-center">
              UserName
            </h5>
            <h5 className="text-sm font-medium uppercase xsm:text-base text-center">
              Token Number
            </h5>
            <h5 className="text-sm font-medium uppercase xsm:text-base text-center">
              Count
            </h5>
            <h5 className="hidden text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Email
            </h5>
            <h5 className="hidden text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Date
            </h5>
            <h5 className="hidden text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Phone
            </h5>
            <h5 className="hidden text-sm font-medium uppercase xsm:text-base text-center sm:block">
              Action
            </h5>
          </div>
          {people.length === 0 && noRecordsFound ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
              No records found.
            </div>
          ) : (
            people.map((person, index) => {
              const matchingRange = rangeList.find(
                (range) =>
                  parseInt(person.tokenNumber) >= range.startRange &&
                  parseInt(person.tokenNumber) <= range.endRange,
              );

              if (matchingRange) {
                return (
                  <div
                    key={person._id}
                    className={`grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-9 p-2.5`}
                    style={{ backgroundColor: matchingRange.color }}
                  >
                    <div className="hidden items-center justify-center sm:flex">
                      <p className="text-white">{serialNumber + index}</p>
                    </div>
                    <div className="hidden items-center justify-center sm:flex">
                      <p className="text-white dark:text-white">
                        {person.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-white dark:text-white">
                        {person.userName}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-white dark:text-white">
                        {person.tokenNumber}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-white dark:text-white">
                        {person.count}
                      </p>
                    </div>
                    <div className="hidden items-center justify-center sm:flex">
                      <p className="text-white dark:text-white">
                        {person.email}
                      </p>
                    </div>
                    <div className="hidden items-center justify-center sm:flex">
                      <p className="text-white dark:text-white">
                        {formatDate(person.date)}
                      </p>
                    </div>
                    <div className="hidden items-center justify-center sm:flex">
                      <p className="text-white dark:text-white">
                        {person.contactNumber}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-meta-5">
                        <button
                          onClick={() => deleteEntry(person._id)}
                          className="inline-flex items-center justify-center rounded-full bg-meta-5 py-4 px-10 text-center font-semibold text-white hover:bg-opacity-90 lg:px-5 xl:px-5"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })
          )}
          <h2>Total Count: {totalCount}</h2>
        </div>
      </div>
    </div>
  );
};

export default Entries;
