package service;

import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import net.java.dualquizz.model.Player;

/**
 * Player REST Service
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Stateless
@Path("net.java.dualquizz.player")
public class PlayerFacadeREST extends AbstractFacade<Player> {
    @PersistenceContext(unitName = "net.java.dualquizz_dualquiz_war_0.1-PU")
    private EntityManager em;

    public PlayerFacadeREST() {
        super(Player.class);
    }

    /**
     * Create a Player if it is not existing.
     * Existence is tested looking for an email (mail attribute) value existing with of the Player.
     * @param player the player to be created 
     * @return Response.ok if a player with same email does not exists. Forbidden, if a player with the same email already exists.
     */
    @POST
    @Consumes({"application/xml", "application/json"})
    public Response createIfNotExists(Player player) {
        // Check if a player exists with the same email
        if(isPlayerExisting(player)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        // Create the entity
        super.create(player);
        // Indicate it is OK
        return Response.ok(player).build();
    }
    
    // check if a user with the same email exist
    private boolean isPlayerExisting(Player player){
        return exists(getEntityManager().createNamedQuery(Player.KEY_PLAYER_SELECT_FROM_MAIL, Player.class), player.getMail());
    }

    /*@PUT
    @Path("{id}")
    @Consumes({"application/xml", "application/json"})
    public void edit(@PathParam("id") String id, Player entity) {
        super.edit(entity);
    }*/

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({"application/xml", "application/json"})
    public Player find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({"application/xml", "application/json"})
    public List<Player> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({"application/xml", "application/json"})
    public List<Player> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces("text/plain")
    public String countREST() {
        return String.valueOf(super.count());
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
