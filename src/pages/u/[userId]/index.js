import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import AdminPanel from "../../../components/pages/userProfile/userAdmin/AdminPanel";
import { auth } from "../../../firebase/clientApp";
import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../../../firebase/clientApp";
import HeaderSection from "../../../components/pages/userProfile/profile/HeaderSection";
import ProfileMobileNav from "../../../components/mobile/ProfileMobileNav";
import VehicleSection from "../../../components/pages/userProfile/Vehicles/public/VehicleSection";
import { useDispatch, useSelector } from "react-redux";
import { addVehiclePreviews } from "../../../store/slices/uiSlice";
import ProfileLoading from "../../../components/helpers/loading/ProfileLoading";

import StickyUserInfo from "../../../components/sections/profile/StickyUserInfo";
import Head from "next/head";

export default function UserProfile({ userData }) {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [vehiclePreviews, setVehiclePreviews] = useState(null);
  const { userId } = router.query;
  const [user] = useAuthState(auth);
  const isValid = user?.uid === userId;
  const dispatch = useDispatch();
  const uploading = useSelector((store) => store.modifications.uploading);
  const showStickyInfo = useSelector(
    (store) => store.profileUI.showStickyUserInfo
  );

  // profile changes from DB
  useEffect(() => {
    onSnapshot(doc(firestore, `users/${userData.uid}`), (doc) => {
      const getSubs = async () => {
        let previews = [];
        // get snippets || path to that specific collection
        const snippetDocs = await getDocs(
          collection(firestore, `users/${userId}/vehiclePreviews`)
        );
        snippetDocs.docs.map((doc) => {
          previews.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setVehiclePreviews(previews);
        if (previews) {
          dispatch(addVehiclePreviews({ previews }));
        }
      };
      const userData = {
        ...doc.data(),
        createdAt: new Date(
          doc.data()?.createdAt.seconds * 1000
        ).toLocaleString("en-US"),
      };
      setProfileUser(userData);
      getSubs();
    });
  }, [userId, userData.uid, uploading]);
  // We trigger a re render when {{ uploading }} changes due to a new mod been added so it can show the incremented value

  return (
    <>
      <Head>
        <title>
          {profileUser
            ? `SimpliMods | ${profileUser.name} profile`
            : `simpli mods`}
        </title>
        <meta
          name="description"
          content={
            profileUser
              ? `Visit ${profileUser.name} Profile to explore their Modifications, Events & more.`
              : `simpli mods`
          }
        />
      </Head>
      <div className="min-h-screen md:flex md:flex-row">
        {isValid && <AdminPanel profileUser={profileUser} />}

        <div
          className={` ${isValid && "profileWidth"} ${
            !isValid &&
            " lg:max-w-2xl w-full md:border-x lg:border-greyDark lg:mx-auto"
          }`}
        >
          {profileUser ? (
            <>
              <StickyUserInfo isValid={isValid} user={profileUser} />
              <div className="-mt-14 sm:-mt-16">
                <HeaderSection profileUser={profileUser} isValid={isValid} />
                {vehiclePreviews && vehiclePreviews.length !== 0 && (
                  <>
                    <VehicleSection
                      vehicles={vehiclePreviews}
                      userId={userId}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <ProfileLoading />
            </>
          )}
        </div>

        {isValid && <ProfileMobileNav />}
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { userId } = ctx.query;

  try {
    const docRef = doc(firestore, `users/${userId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = {
        ...docSnap.data(),
        createdAt: new Date(
          docSnap.data()?.createdAt.seconds * 1000
        ).toLocaleString("en-US"),
      };
      return {
        props: {
          userData,
        },
      };
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    console.log(err);
    // TODO: Redirect to correct page
    return {
      redirect: {
        destination: "/u/pRufKEb4bMVvih2hLPdn9uDdoJI3",
        permanent: false,
      },
    };
  }
};
