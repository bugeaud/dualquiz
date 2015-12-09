package service;

import java.util.ArrayList;
import java.util.List;
import javax.ejb.EJB;
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
import javax.ws.rs.QueryParam;
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
    
    @EJB
    NotificationService notificationService;
    
    @GET
    @Path("{id}/notify")
    @Produces({"application/xml", "application/json"})
    public Response notifyPlayer(@PathParam("id") Integer id, @QueryParam("title") String title, @QueryParam("message") String message) {
        final Player player = super.find(id);
        if(player == null ){
            // no player was found
            /* @todo need*/
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        notificationService.notifyPlayer(player, title, message);
        
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
    @Path("find/{filter}")
    @Produces({"application/xml", "application/json"})
    public List<Player> findUsers(@PathParam("filter") String filter) {
        // Use MongoDB Native query with regexp json sequence
        // This is required as text index ($text) is oddly not yet implementing partial word match
        javax.persistence.Query q = getEntityManager().createNativeQuery("db.Player.find( { \"$or\" : [ { \"mail\" : { \"$regex\": \".*"+filter+".*\", \"$options\": \"si\" } }, { \"firstName\" : { \"$regex\": \".*"+filter+".*\", \"$options\": \"si\" } }, { \"lastName\": { \"$regex\": \".*"+filter+".*\", \"$options\": \"si\" } } ] } )");
        final List items = q.getResultList();
        final List<Player> players = new ArrayList<>();
        
        // Perform some lazy MongoDB returned data to Java beans mapping so that it can produces the expected format
        for(Object obj : items){
            players.add(createPlayer((Object[])obj));
        }
        return players;
    }

    
    public static Player createPlayer(Object[] properties){
        Player player = new Player();
        if(properties==null){
            return player;
        }
        if(properties.length>0){
            player.setId(Integer.parseInt((String)properties[0]));
        }
        if(properties.length>1){
            player.setMail((String)properties[1]);
        }
        if(properties.length>2){
            player.setFirstName((String)properties[2]);
        }
        if(properties.length>3){
            player.setLastName((String)properties[3]);
        }
        return player;
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
