import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import AdminPanel from "../../../components/sections/userAdmin/AdminPanel";
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
import HeaderSection from "../../../components/sections/profile/HeaderSection";
import ProfileMobileNav from "../../../components/mobile/ProfileMobileNav";
import VehicleSection from "../../../components/sections/Vehicles/public/VehicleSection";
import AdminPanelLoading from "../../../components/helpers/loading/AdminPanelLoading";
import { useDispatch } from "react-redux";
import { addVehiclePreviews } from "../../../store/slices/uiSlice";
import ProfileLoading from "../../../components/helpers/loading/ProfileLoading";
import ModTabs from "../../../components/sections/Vehicles/public/ModTabs";

export default function UserProfile({ userData }) {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState(null);
  const [vehiclePreviews, setVehiclePreviews] = useState(null);
  const { userId } = router.query;
  const [user] = useAuthState(auth);
  const isValid = user?.uid === userId;
  const dispatch = useDispatch();

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
        console.log(previews);
        setVehiclePreviews(previews);
        if (isValid && previews) {
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
  }, [userId, userData.uid]);

  return (
    <>
      <div className="w-full h-full md:flex md:flex-row md:h-screen">
        {isValid && <AdminPanel profileUser={profileUser} />}

        <div
          className={`h-full ${isValid && "profileWidth"} ${
            !isValid &&
            " lg:max-w-2xl w-full md:border-x lg:border-greyDark lg:mx-auto"
          }`}
        >
          {profileUser ? (
            <>
              <HeaderSection profileUser={profileUser} isValid={isValid} />

              {vehiclePreviews && vehiclePreviews.length !== 0 && (
                <>
                  <VehicleSection vehicles={vehiclePreviews} />
                  <ModTabs />
                </>
              )}
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
    return {
      redirect: {
        destination: "/nf",
        permanent: false,
      },
    };
  }
};
