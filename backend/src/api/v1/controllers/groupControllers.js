import mongoose from "mongoose";
import Group from "../models/group.js";
import User from "../models/user.js";


//================================================================
export const createGroup = async (req, res) => {
  try {
    const { name, description, location, isPrivate, image, locationName, locationLat, locationLng } = req.body;
    if (!name) return res.status(400).json({ message: "Es necesario dar un nombre al grupo." });

    const newGroup = new Group({
      name,
      description: description || "",
      location: location || "",
      locationName: locationName || "",
      locationLat: locationLat || "",
      locationLng: locationLng || "",
      isPrivate: isPrivate || false,
      image: image || "",
      creator: req.user.id,
      members: [{ user: req.user.id }],
      moderators: [req.user.id],
    });

    await newGroup.save();
    return res.status(201).json({ message: "Grupo creado correctamente.", group: newGroup });
  } catch (error) {
    console.error("Error al crear grupo:", error);
    return res.status(500).json({ message: "Error al crear grupo", error });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { isPrivate: false },            //* públicos
        { "members.user": req.user.id }     //* privados-miembro
      ]
    })
      .populate("creator", "name email profileImage")
      .populate("members.user", "name email profileImage")
      .populate("moderators", "name email profileImage");

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    return res.status(500).json({ message: "Error al obtener grupos", error });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID de grupo no válido." });

    const group = await Group.findById(id)
      .populate("creator", "name email profileImage")
      .populate("members.user", "name email profileImage")
      .populate("moderators", "name email profileImage")
      .populate("pendingRequests.user", "name location profileImage")
      .populate("members.user", "name location profileImage");

    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isMember = group.members.some(m => m.user._id.toString() === req.user.id);
    if (group.isPrivate && !isMember && req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado a este grupo privado." });
    }

    return res.status(200).json(group);
  } catch (error) {
    console.error("Error al obtener grupo:", error);
    return res.status(500).json({ message: "Error al obtener grupo", error });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario no válido." });
    }

    const groups = await Group.find({ "members.user": userId })
      .populate("creator", "name email profileImage")
      .populate("members.user", "name email profileImage")
      .populate("moderators", "name email profileImage");

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error al obtener grupos del usuario:", error);
    return res.status(500).json({ message: "Error al obtener grupos del usuario", error });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isModerator = group.moderators.some(m => m.toString() === req.user.id);
    if (!isModerator && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para actualizar este grupo." });
    }

    Object.assign(group, updates);
    await group.save();

    return res.status(200).json({ message: "Grupo actualizado correctamente.", group });
  } catch (error) {
    console.error("Error al actualizar grupo:", error);
    return res.status(500).json({ message: "Error al actualizar grupo", error });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isModerator = group.moderators.some(m => m.toString() === req.user.id);
    if (!isModerator && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para eliminar este grupo." });
    }

    await group.deleteOne();
    return res.status(200).json({ message: "Grupo eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    return res.status(500).json({ message: "Error al eliminar grupo", error });
  }
};


//* in==========================================================

export const requestToJoinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isMember = group.members.some(m => m.user.toString() === userId);
    const alreadyRequested = group.pendingRequests.some(r => r.user.toString() === userId);

    if (isMember) return res.status(400).json({ message: "Ya eres miembro del grupo." });
    if (alreadyRequested) return res.status(400).json({ message: "Ya has solicitado unirte a este grupo." });

    group.pendingRequests.push({ user: userId });
    await group.save();

    return res.status(200).json({ message: "Solicitud enviada. Espera la aprobación del moderador." });
  } catch (error) {
    console.error("Error al solicitar unirse:", error);
    return res.status(500).json({ message: "Error al solicitar unirse al grupo", error });
  }
};





export const approveJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const group = await Group.findById(id).populate("pendingRequests.user", "name location profileImage");
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    //* moderadores o creador


    const isCreator = group.creator.toString() === req.user.id;
    const isModerator = group.moderators.some(m => m.toString() === req.user.id);

    if (!isModerator && !isCreator) return res.status(403).json({ message: "No tienes permisos para aprobar solicitudes." });




    //* indice de la solicitud
    const requestIndex = group.pendingRequests.findIndex(r => {
      const uid = r.user._id ? r.user._id.toString() : r.user.toString(); 
      return uid === userId;
    });
    if (requestIndex === -1) return res.status(404).json({ message: "Solicitud no encontrada." });

    const approvedUser = group.pendingRequests[requestIndex].user;

    //* agregar miembro
    group.members.push({ user: approvedUser._id ? approvedUser._id : approvedUser });

    //* eliminar de pendingRequests
    group.pendingRequests.splice(requestIndex, 1);

    await group.save();

    return res.status(200).json({ 
      message: "Solicitud aprobada.", 
      group,
      approvedUser: {
        _id: approvedUser._id || approvedUser,
        name: approvedUser.name || "",
        location: approvedUser.location || "",
        profileImage: approvedUser.profileImage || "",
      }
    });
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    return res.status(500).json({ message: "Error al aprobar solicitud", error: error.message });
  }
};


export const rejectJoinRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const group = await Group.findById(id).populate("pendingRequests.user", "name location profileImage");
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isModerator = group.moderators.some(m => m.toString() === req.user.id);
    if (!isModerator) return res.status(403).json({ message: "No tienes permisos para rechazar solicitudes." });

    const requestIndex = group.pendingRequests.findIndex(r => r.user._id?.toString() === userId || r.user.toString() === userId);
    if (requestIndex === -1) return res.status(404).json({ message: "Solicitud no encontrada." });

    const rejectedUser = group.pendingRequests.splice(requestIndex, 1)[0].user;

    await group.save();

    return res.status(200).json({
      message: "Solicitud rechazada.",
      group,
      rejectedUser: {
        _id: rejectedUser._id,
        name: rejectedUser.name,
        location: rejectedUser.location,
        profileImage: rejectedUser.profileImage
      }
    });
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    return res.status(500).json({ message: "Error al rechazar solicitud", error });
  }
};


export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isMember = group.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(400).json({ message: "Este usuario no pertenece al grupo." });

    group.members = group.members.filter(m => m.user.toString() !== userId);
    await group.save();

    return res.status(200).json({ message: "Has salido del grupo.", group });
  } catch (error) {
    console.error("Error al salir del grupo:", error);
    return res.status(500).json({ message: "Error al salir del grupo", error });
  }
};


//? MIEMBROS

export const changeToModerator = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { action } = req.body; 

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    //* permisos
    const isCreator = group.creator.toString() === req.user.id;
    const isModerator = group.moderators.some(m => m.toString() === req.user.id);
    const isPlatformAdmin = req.user.role === "admin";

    if (!isCreator && !isModerator && !isPlatformAdmin) {
      return res.status(403).json({ message: "No tienes permisos para gestionar moderadores." });
    }

    const isMember = group.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(404).json({ message: "El usuario no es miembro del grupo." });

    if (action === "promote") {
      if (!group.moderators.includes(userId)) {
        group.moderators.push(userId);
      }
    } else {
      if (group.creator.toString() === userId) {
        return res.status(400).json({ message: "El creador siempre debe ser moderador." });
      }
      group.moderators = group.moderators.filter(m => m.toString() !== userId);
    }

    await group.save();
    return res.status(200).json({ 
      message: action === "promote" ? "Ascendido a moderador." : "Rango revocado.", 
      group 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor.", error });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Grupo no encontrado." });

    const isModerator = group.moderators.some(m => m.toString() === req.user.id);
    if (!isModerator && req.user.role !== "admin") return res.status(403).json({ message: "No tienes permisos para eliminar miembros." });

    const before = group.members.length;
    group.members = group.members.filter(m => m.user.toString() !== userId);
    group.moderators = group.moderators.filter(m => m.toString() !== userId);

    if (group.members.length === before) return res.status(404).json({ message: "Miembro no encontrado." });

    await group.save();
    return res.status(200).json({ message: "Miembro eliminado del grupo.", group });
  } catch (error) {
    console.error("Error al eliminar miembro:", error);
    return res.status(500).json({ message: "Error al eliminar miembro", error });
  }
};
